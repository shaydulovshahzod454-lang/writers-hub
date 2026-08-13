from django.db import models
from projects.models import Project
from characters.models import Character


class Evidence(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='evidence_items'
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    found_location = models.CharField(max_length=255, blank=True)
    is_real = models.BooleanField(default=True)
    related_characters = models.ManyToManyField(
        Character,
        related_name='evidence_items',
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name