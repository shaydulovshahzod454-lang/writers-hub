from rest_framework import serializers
from .models import Project, ProjectMember


class ProjectSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'genre', 'description',
            'general_idea', 'owner', 'created_at', 'updated_at'
        ]

class ProjectMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = ProjectMember
        fields = ['id', 'project', 'user', 'username', 'joined_at']