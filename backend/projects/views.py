from django.db.models import Q
from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from .models import Project, ProjectMember
from .serializers import ProjectSerializer, ProjectMemberSerializer
from django.http import HttpResponse
from docx import Document
from rest_framework.decorators import action
from rest_framework.response import Response

User = get_user_model()


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(
            Q(owner=self.request.user) | Q(members__user=self.request.user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['get'])
    def export_docx(self, request, pk=None):
        project = self.get_object()
        chapters = project.chapters.all().order_by('order')

        document = Document()
        document.add_heading(project.title, level=0)
        if project.description:
            document.add_paragraph(project.description)

        for chapter in chapters:
            document.add_heading(chapter.title, level=1)
            document.add_paragraph(chapter.content)

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
        response['Content-Disposition'] = f'attachment; filename="{project.title}.docx"'
        document.save(response)
        return response


class ProjectMemberViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectMemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = ProjectMember.objects.filter(
            Q(project__owner=user) | Q(project__members__user=user)
        ).distinct()
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        username = serializer.validated_data.pop('username')
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise ValidationError({'username': 'User topilmadi'})
        serializer.save(user=user)