from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    email = serializers.EmailField(required=True)
    full_name = serializers.CharField(source='first_name', required=True, max_length=150)

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'password']

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Bu email allaqachon ro\'yxatdan o\'tgan.')
        return value

    def create(self, validated_data):
        email = validated_data['email']
        base_username = email.split('@')[0]
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
        )
        return user


class MeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'first_name']