from rest_framework.routers import DefaultRouter
from .views import BoardItemViewSet, BoardConnectionViewSet

router = DefaultRouter()
router.register('board-items', BoardItemViewSet, basename='board-item')
router.register('board-connections', BoardConnectionViewSet, basename='board-connection')

urlpatterns = router.urls