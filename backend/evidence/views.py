from django.db.models import Q
from rest_framework import viewsets, permissions
from .models import Evidence
from .serializers import EvidenceSerializer
from notifications.utils import notify_project


class EvidenceViewSet(viewsets.ModelViewSet):
    serializer_class = EvidenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Evidence.objects.filter(
            Q(project__owner=user) | Q(project__members__user=user)
        ).select_related('project').distinct()
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        evidence = serializer.save()
        actor = self.request.user
        actor_name = actor.first_name or actor.email
        notify_project(
            project=evidence.project,
            actor=actor,
            verb='evidence_created',
            message=f'{actor_name} yangi dalil qo\'shdi: "{evidence.name}"',
            link=f'/projects/{evidence.project.id}',
        )