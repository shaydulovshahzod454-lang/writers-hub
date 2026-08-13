from django.db.models import Q
from rest_framework import viewsets, permissions
from .models import Character
from .serializers import CharacterSerializer


class CharacterViewSet(viewsets.ModelViewSet):
    serializer_class = CharacterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Character.objects.filter(
            Q(project__owner=user) | Q(project__members__user=user)
        ).distinct()