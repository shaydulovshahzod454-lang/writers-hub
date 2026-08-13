from django.db import models
from projects.models import Project
from characters.models import Character


class TimelineEvent(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='timeline_events'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    event_time = models.CharField(max_length=100, blank=True)
    order = models.PositiveIntegerField(default=0)
    characters = models.ManyToManyField(
        Character,
        related_name='timeline_events',
        blank=True
    )

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title