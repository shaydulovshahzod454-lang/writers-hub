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
    email = serializers.EmailField(write_only=True)
    user = serializers.ReadOnlyField(source='user.username')
    user_email = serializers.ReadOnlyField(source='user.email')
    user_name = serializers.ReadOnlyField(source='user.first_name')

    class Meta:
        model = ProjectMember
        fields = ['id', 'project', 'user', 'user_email', 'user_name', 'email', 'joined_at']