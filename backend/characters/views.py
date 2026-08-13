from rest_framework import viewsets, permissions
from .models import Character
from .serializers import CharacterSerializer


class CharacterViewSet(viewsets.ModelViewSet):
    serializer_class = CharacterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Character.objects.filter(project__owner=self.request.user)