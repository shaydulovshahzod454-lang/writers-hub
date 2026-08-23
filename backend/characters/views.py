from django.db.models import Q
from rest_framework import viewsets, permissions
from .models import Character, Relationship
from .serializers import CharacterSerializer, RelationshipSerializer
from notifications.utils import notify_project


class CharacterViewSet(viewsets.ModelViewSet):
    serializer_class = CharacterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Character.objects.filter(
            Q(project__owner=user) | Q(project__members__user=user)
        ).select_related('project').distinct()
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        character = serializer.save()
        actor = self.request.user
        actor_name = actor.first_name or actor.email
        notify_project(
            project=character.project,
            actor=actor,
            verb='character_created',
            message=f'{actor_name} yangi personaj qo\'shdi: "{character.name}"',
            link=f'/characters/{character.id}',
        )


class RelationshipViewSet(viewsets.ModelViewSet):
    serializer_class = RelationshipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Relationship.objects.filter(
            Q(from_character__project__owner=user) | Q(from_character__project__members__user=user)
        ).select_related('from_character', 'to_character').distinct()
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(from_character__project_id=project_id)
        return queryset