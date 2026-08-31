from django.db.models import Q
from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from characters.models import Character
from evidence.models import Evidence
from timeline.models import TimelineEvent
from .models import BoardItem, BoardConnection
from .serializers import BoardItemSerializer, BoardConnectionSerializer

REF_MODELS = {
    'character': Character,
    'evidence': Evidence,
    'event': TimelineEvent,
}


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

    def perform_create(self, serializer):
        project = serializer.validated_data.get('project')
        item_type = serializer.validated_data.get('item_type')
        ref_id = serializer.validated_data.get('ref_id')

        model = REF_MODELS.get(item_type)
        if model is not None and ref_id is not None:
            if not model.objects.filter(id=ref_id, project=project).exists():
                raise ValidationError('Bu element shu loyihaga tegishli emas.')

        serializer.save()


class BoardConnectionViewSet(viewsets.ModelViewSet):
    serializer_class = BoardConnectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = BoardConnection.objects.filter(
            Q(project__owner=user) | Q(project__members__user=user)
        ).select_related('project', 'from_item', 'to_item').distinct()
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        project = serializer.validated_data.get('project')
        from_item = serializer.validated_data.get('from_item')
        to_item = serializer.validated_data.get('to_item')

        if from_item.project_id != project.id or to_item.project_id != project.id:
            raise ValidationError('Bog\'lanayotgan elementlar shu loyihaga tegishli bo\'lishi kerak.')

        serializer.save()