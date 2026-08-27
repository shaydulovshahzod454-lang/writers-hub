from django.db.models import Q
from rest_framework import viewsets, permissions
from .models import BoardItem, BoardConnection
from .serializers import BoardItemSerializer, BoardConnectionSerializer


class BoardItemViewSet(viewsets.ModelViewSet):
    serializer_class = BoardItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = BoardItem.objects.filter(
            Q(project__owner=user) | Q(project__members__user=user)
        ).select_related('project').distinct()
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset


class BoardConnectionViewSet(viewsets.ModelViewSet):
    serializer_class = BoardConnectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = BoardConnection.objects.filter(
            Q(project__owner=user) | Q(project__members__user=user)
        ).select_related('project').distinct()
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset