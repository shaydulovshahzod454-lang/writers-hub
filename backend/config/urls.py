from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('projects.urls')),
    path('api-auth/', include('rest_framework.urls')),
    path('api/', include('characters.urls')),
    path('api/', include('chapters.urls')),
]