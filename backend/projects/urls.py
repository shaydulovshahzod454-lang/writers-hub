from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, ProjectMemberViewSet

router = DefaultRouter()
router.register('projects', ProjectViewSet, basename='project')
router.register('project-members', ProjectMemberViewSet, basename='project-member')

urlpatterns = router.urls