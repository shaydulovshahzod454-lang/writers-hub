from django.db.models import Q
from rest_framework import viewsets, permissions
from .models import TimelineEvent
from .serializers import TimelineEventSerializer


class TimelineEventViewSet(viewsets.ModelViewSet):
    serializer_class = TimelineEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = TimelineEvent.objects.filter(
            Q(project__owner=user) | Q(project__members__user=user)
        ).distinct()
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset