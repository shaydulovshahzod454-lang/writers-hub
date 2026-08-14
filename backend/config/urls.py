from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('projects.urls')),
    path('api/', include('characters.urls')),
    path('api/', include('chapters.urls')),
    path('api/', include('evidence.urls')),
    path('api/', include('timeline.urls')),
    path('api/', include('accounts.urls')),
]