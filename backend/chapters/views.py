from django.db.models import Q
from rest_framework import viewsets, permissions
from .models import Chapter, Comment
from .serializers import ChapterSerializer, CommentSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from groq import Groq
from django.conf import settings


class ChapterViewSet(viewsets.ModelViewSet):
    serializer_class = ChapterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Chapter.objects.filter(
            Q(project__owner=user) | Q(project__members__user=user)
        ).distinct()
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

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

        prompt = f"""Sen detektiv/mystery janridagi asarni tahrirlovchi yordamchisan.
Quyida loyihaning ma'lumot bazasi (personajlar, timeline, dalillar) va yozuvchi yozayotgan bob matni berilgan.

PERSONAJLAR:
{char_info}

TIMELINE:
{timeline_info}

DALILLAR:
{evidence_info}

BOB MATNI:
{chapter.content}

Vazifang: bob matnini yuqoridagi ma'lumot bazasi bilan solishtir. Agar ziddiyat topsang (masalan personaj tavsifiga mos kelmaydigan xatti-harakat, timeline bilan mos kelmaydigan vaqt, dalil bilan zid keladigan tafsilot), har birini aniq ko'rsat va qanday tuzatish mumkinligini qisqacha taklif qil. Agar ziddiyat topmasang, shuni aniq ayt. Javobni o'zbek tilida, qisqa va aniq ro'yxat shaklida ber."""

        client = Groq(api_key=settings.GROQ_API_KEY)
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )

        return Response({'result': completion.choices[0].message.content})

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
        ).distinct()
        chapter_id = self.request.query_params.get('chapter')
        if chapter_id:
            queryset = queryset.filter(chapter_id=chapter_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)