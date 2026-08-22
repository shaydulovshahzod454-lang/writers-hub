from django.conf import settings
from django.db import models
from projects.models import Project


class Notification(models.Model):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True,
        blank=True
    )
    verb = models.CharField(max_length=50)
    message = models.CharField(max_length=255)
    link = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.recipient}: {self.message}"