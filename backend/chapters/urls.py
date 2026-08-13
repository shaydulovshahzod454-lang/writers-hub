from rest_framework.routers import DefaultRouter
from .views import ChapterViewSet, CommentViewSet

router = DefaultRouter()
router.register('chapters', ChapterViewSet, basename='chapter')
router.register('comments', CommentViewSet, basename='comment')

urlpatterns = router.urls