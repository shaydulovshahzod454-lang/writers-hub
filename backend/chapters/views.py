from django.db.models import Q
from rest_framework import viewsets, permissions
from .models import Chapter, Comment
from .serializers import ChapterSerializer, CommentSerializer
from rest_framework.decorators import action
from rest_framework.response import Response


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