from django.db import models
from projects.models import Project


class BoardItem(models.Model):
    ITEM_TYPES = [
        ('character', 'Character'),
        ('evidence', 'Evidence'),
        ('event', 'Event'),
        ('note', 'Note'),
    ]

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='board_items'
    )
    item_type = models.CharField(max_length=20, choices=ITEM_TYPES)
    ref_id = models.PositiveIntegerField(null=True, blank=True)
    note_text = models.TextField(blank=True)
    x = models.FloatField(default=100)
    y = models.FloatField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.item_type} on board of {self.project}"


class BoardConnection(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='board_connections'
    )
    from_item = models.ForeignKey(
        BoardItem,
        on_delete=models.CASCADE,
        related_name='connections_from'
    )
    to_item = models.ForeignKey(
        BoardItem,
        on_delete=models.CASCADE,
        related_name='connections_to'
    )
    label = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.from_item} -> {self.to_item}"