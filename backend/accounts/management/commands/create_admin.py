import os
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    def handle(self, *args, **options):
        username = os.environ.get('ADMIN_USERNAME')
        password = os.environ.get('ADMIN_PASSWORD')
        email = os.environ.get('ADMIN_EMAIL', '')

        if not username or not password:
            self.stdout.write('ADMIN_USERNAME yoki ADMIN_PASSWORD berilmagan, o\'tkazib yuborildi.')
            return

        if User.objects.filter(username=username).exists():
            self.stdout.write(f'"{username}" allaqachon mavjud, o\'tkazib yuborildi.')
            return

        User.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write(f'Superuser "{username}" yaratildi.')