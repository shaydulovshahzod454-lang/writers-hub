from django.conf import settings
from django.db import models


class Project(models.Model):
    title = models.CharField(max_length=255)
    genre = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    general_idea = models.TextField(blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_projects'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title