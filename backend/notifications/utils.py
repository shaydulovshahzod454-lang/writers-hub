from projects.models import ProjectMember
from .models import Notification


def get_project_members(project, exclude_user=None):
    members = set()
    exclude_id = getattr(exclude_user, 'id', None)

    if project.owner_id and project.owner_id != exclude_id:
        members.add(project.owner)

    for pm in ProjectMember.objects.filter(project=project).select_related('user'):
        if pm.user_id != exclude_id:
            members.add(pm.user)

    return members


def notify_project(project, actor, verb, message, link=''):
    recipients = get_project_members(project, exclude_user=actor)
    Notification.objects.bulk_create([
        Notification(recipient=user, project=project, verb=verb, message=message, link=link)
        for user in recipients
    ])