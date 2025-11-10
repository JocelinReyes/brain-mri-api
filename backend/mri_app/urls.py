from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatientViewSet, MRIImageViewSet, upload_csv

router = DefaultRouter()
router.register(r'patients', PatientViewSet)
router.register(r'images', MRIImageViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('upload-csv/', upload_csv, name='upload_csv'),
]