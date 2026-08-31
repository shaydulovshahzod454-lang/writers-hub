import json
from django.db.models import Q
from rest_framework import viewsets, permissions
from .models import Chapter, Comment, ChapterVersion
from .serializers import ChapterSerializer, CommentSerializer, ChapterVersionSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from groq import Groq
from django.conf import settings
from notifications.utils import notify_project


class ChapterViewSet(viewsets.ModelViewSet):
    serializer_class = ChapterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Chapter.objects.filter(
            Q(project__owner=user) | Q(project__members__user=user)
        ).select_related('project').distinct()
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_update(self, serializer):
        instance = serializer.instance
        create_version = self.request.data.get('create_version')
        if create_version and instance.content:
            ChapterVersion.objects.create(
                chapter=instance,
                content=instance.content,
                created_by=self.request.user,
            )
        serializer.save()
        self._sanitize_related(instance)

    def _sanitize_related(self, chapter):
        chapter.related_characters.set(
            chapter.related_characters.filter(project=chapter.project)
        )
        chapter.related_evidence.set(
            chapter.related_evidence.filter(project=chapter.project)
        )
        chapter.related_events.set(
            chapter.related_events.filter(project=chapter.project)
        )

    def perform_create(self, serializer):
        chapter = serializer.save()
        self._sanitize_related(chapter)
        actor = self.request.user
        actor_name = actor.first_name or actor.email
        notify_project(
            project=chapter.project,
            actor=actor,
            verb='chapter_created',
            message=f'{actor_name} yangi bob yaratdi: "{chapter.title}"',
            link=f'/chapters/{chapter.id}',
        )

    @action(detail=True, methods=['get'])
    def versions(self, request, pk=None):
        chapter = self.get_object()
        versions = chapter.versions.all()[:30]
        return Response(ChapterVersionSerializer(versions, many=True).data)

    @action(detail=True, methods=['post'])
    def restore_version(self, request, pk=None):
        chapter = self.get_object()
        version_id = request.data.get('version_id')
        try:
            version = chapter.versions.get(id=version_id)
        except ChapterVersion.DoesNotExist:
            return Response({'error': 'Versiya topilmadi'}, status=404)

        if chapter.content:
            ChapterVersion.objects.create(
                chapter=chapter,
                content=chapter.content,
                created_by=request.user,
            )
        chapter.content = version.content
        chapter.save()
        return Response(ChapterSerializer(chapter).data)

    @action(detail=True, methods=['post'])
    def check_consistency(self, request, pk=None):
        chapter = self.get_object()
        project = chapter.project

        characters = project.characters.all()
        char_info = "\n".join([
            f"- {c.name}: yosh={c.age or '?'}, kasb={c.occupation or '?'}, "
            f"tashqi ko'rinishi={c.appearance or '?'}, xarakteri={c.personality or '?'}, "
            f"o'tmishi={c.backstory or '?'}"
            for c in characters
        ]) or "Personajlar hali kiritilmagan."

        events = project.timeline_events.all().order_by('order')
        timeline_info = "\n".join([
            f"- {e.event_time}: {e.title}" for e in events
        ]) or "Timeline hali kiritilmagan."

        evidence = project.evidence_items.all()
        evidence_info = "\n".join([
            f"- {ev.name} ({'haqiqiy' if ev.is_real else 'soxta'}): "
            f"topilgan joy={ev.found_location or '?'}, tavsif={ev.description or '?'}"
            for ev in evidence
        ]) or "Dalillar hali kiritilmagan."

        chapter_content = chapter.content or ''
        if not chapter_content.strip():
            return Response(
                {'error': 'Bob matni bo\'sh, tekshirish uchun avval biror narsa yozing.'},
                status=400
            )

        MAX_CONTENT_CHARS = 12000
        if len(chapter_content) > MAX_CONTENT_CHARS:
            chapter_content = chapter_content[:MAX_CONTENT_CHARS] + '\n\n[...matn juda uzun, qisqartirildi...]'

        prompt = f"""Sen detektiv/mystery janridagi asarni tahrirlovchi yordamchisan.
Quyida loyihaning ma'lumot bazasi (personajlar, timeline, dalillar) va yozuvchi yozayotgan bob matni berilgan.

PERSONAJLAR:
{char_info}

TIMELINE:
{timeline_info}

DALILLAR:
{evidence_info}

BOB MATNI:
{chapter_content}

Vazifang: bob matnini yuqoridagi ma'lumot bazasi bilan solishtir va potensial ziddiyatlarni top (masalan personaj tavsifiga mos kelmaydigan xatti-harakat, timeline bilan mos kelmaydigan vaqt, dalil bilan zid keladigan tafsilot).

Javobni FAQAT quyidagi JSON massiv formatida qaytar, boshqa hech qanday matn, izoh yoki markdown belgisi (masalan ```) qo'shma:

[
  {{
    "issue": "Ziddiyatning qisqa nomi",
    "chapter_source": "Bob matnidan aynan qaysi jumla yoki qism (qisqa iqtibos)",
    "project_source": "Qaysi personaj/dalil/timeline ma'lumoti bilan zid (aniq nom bilan)",
    "explanation": "Nima uchun bu potensial muammo ekanini tushuntir",
    "suggested_action": "Nima qilish mumkinligi bo'yicha aniq taklif",
    "confidence": "High" | "Medium" | "Low"
  }}
]

Agar hech qanday ziddiyat topmasang, bo'sh massiv qaytar: []
Hammasi o'zbek tilida bo'lsin, faqat "confidence" qiymati High/Medium/Low bo'lsin."""

        try:
            client = Groq(api_key=settings.GROQ_API_KEY)
            completion = client.chat.completions.create(
                model="openai/gpt-oss-120b",
                max_tokens=1500,
                messages=[{"role": "user", "content": prompt}]
            )
            raw_result = completion.choices[0].message.content
        except Exception:
            return Response(
                {'error': 'AI xizmati bilan bog\'lanishda xatolik yuz berdi. Birozdan so\'ng qaytadan urinib ko\'ring.'},
                status=502
            )

        issues = self._parse_ai_issues(raw_result)
        if issues is not None:
            return Response({'issues': issues})

        return Response({'result': raw_result})

    def _parse_ai_issues(self, raw_text):
        text = raw_text.strip()
        if text.startswith('```'):
            text = text.strip('`')
            if text.lower().startswith('json'):
                text = text[4:]
            text = text.strip()

        start = text.find('[')
        end = text.rfind(']')
        if start == -1 or end == -1 or end < start:
            return None

        try:
            parsed = json.loads(text[start:end + 1])
        except (json.JSONDecodeError, ValueError):
            return None

        if not isinstance(parsed, list):
            return None

        valid_issues = []
        for item in parsed:
            if not isinstance(item, dict):
                continue
            valid_issues.append({
                'issue': str(item.get('issue', ''))[:300],
                'chapter_source': str(item.get('chapter_source', ''))[:300],
                'project_source': str(item.get('project_source', ''))[:300],
                'explanation': str(item.get('explanation', ''))[:600],
                'suggested_action': str(item.get('suggested_action', ''))[:400],
                'confidence': item.get('confidence') if item.get('confidence') in ('High', 'Medium', 'Low') else 'Medium',
            })
        return valid_issues

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        order_data = request.data.get('order', [])
        queryset = self.get_queryset()
        for item in order_data:
            queryset.filter(id=item['id']).update(order=item['order'])
        return Response({'status': 'ok'})


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Comment.objects.filter(
            Q(chapter__project__owner=user) | Q(chapter__project__members__user=user)
        ).select_related('author', 'chapter').distinct()
        chapter_id = self.request.query_params.get('chapter')
        if chapter_id:
            queryset = queryset.filter(chapter_id=chapter_id)
        return queryset

    def perform_create(self, serializer):
        comment = serializer.save(author=self.request.user)
        chapter = comment.chapter
        actor = self.request.user
        actor_name = actor.first_name or actor.email
        notify_project(
            project=chapter.project,
            actor=actor,
            verb='comment',
            message=f'{actor_name} "{chapter.title}" boliga izoh qoldirdi',
            link=f'/chapters/{chapter.id}',
        )