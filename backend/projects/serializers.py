from rest_framework import serializers
from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'genre', 'description',
            'general_idea', 'owner', 'created_at', 'updated_at'
        ]