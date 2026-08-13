from django.db.models import Q
from rest_framework import viewsets, permissions
from .models import Chapter, Comment
from .serializers import ChapterSerializer, CommentSerializer


class ChapterViewSet(viewsets.ModelViewSet):
    serializer_class = ChapterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Chapter.objects.filter(
            Q(project__owner=user) | Q(project__members__user=user)
        ).distinct()


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Comment.objects.filter(
            Q(chapter__project__owner=user) | Q(chapter__project__members__user=user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)