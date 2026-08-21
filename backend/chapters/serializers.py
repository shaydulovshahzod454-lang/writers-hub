from rest_framework import serializers
from .models import Chapter, Comment, ChapterVersion


class ChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = '__all__'


class ChapterVersionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ChapterVersion
        fields = ['id', 'content', 'created_by_name', 'created_at']

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.first_name or obj.created_by.email
        return 'Noma\'lum'


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Comment
        fields = ['id', 'chapter', 'author', 'text', 'quoted_text', 'resolved', 'created_at']