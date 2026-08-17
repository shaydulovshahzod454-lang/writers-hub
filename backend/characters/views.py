from django.db.models import Q
from rest_framework import viewsets, permissions
from .models import Character, Relationship
from .serializers import CharacterSerializer, RelationshipSerializer


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