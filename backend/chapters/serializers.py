from rest_framework import serializers
from .models import Chapter, Comment


class ChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Comment
        fields = ['id', 'chapter', 'author', 'text', 'quoted_text', 'resolved', 'created_at']