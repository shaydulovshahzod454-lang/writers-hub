from rest_framework import serializers
from .models import Character, Relationship


class CharacterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Character
        fields = '__all__'

class RelationshipSerializer(serializers.ModelSerializer):
    from_character_name = serializers.ReadOnlyField(source='from_character.name')
    to_character_name = serializers.ReadOnlyField(source='to_character.name')

    class Meta:
        model = Relationship
        fields = [
            'id', 'from_character', 'to_character',
            'from_character_name', 'to_character_name',
            'relationship_type', 'notes'
        ]