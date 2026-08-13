from rest_framework import viewsets, permissions
from .models import Chapter, Comment
from .serializers import ChapterSerializer, CommentSerializer


class ChapterViewSet(viewsets.ModelViewSet):
    serializer_class = ChapterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Chapter.objects.filter(project__owner=self.request.user)

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(chapter__project__owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)