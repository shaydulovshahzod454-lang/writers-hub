from rest_framework.routers import DefaultRouter
from .views import TimelineEventViewSet

router = DefaultRouter()
router.register('timeline-events', TimelineEventViewSet, basename='timeline-event')

urlpatterns = router.urls