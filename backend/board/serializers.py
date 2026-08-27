from rest_framework import serializers
from .models import BoardItem, BoardConnection


class BoardItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoardItem
        fields = ['id', 'project', 'item_type', 'ref_id', 'note_text', 'x', 'y', 'created_at']


class BoardConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoardConnection
        fields = ['id', 'project', 'from_item', 'to_item', 'label', 'created_at']