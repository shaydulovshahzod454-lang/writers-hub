from django.db import models
from projects.models import Project


class Character(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='characters'
    )
    name = models.CharField(max_length=255)
    alias = models.CharField(max_length=255, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    occupation = models.CharField(max_length=255, blank=True)
    appearance = models.TextField(blank=True)
    personality = models.TextField(blank=True)
    backstory = models.TextField(blank=True)
    goal = models.TextField(blank=True)
    motivation = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name