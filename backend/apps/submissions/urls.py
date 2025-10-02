from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubmissionViewSet

router = DefaultRouter()
# we will register the viewset under a dummy prefix and wire it via include in forms.urls
router.register(r'', SubmissionViewSet, basename='submission')

urlpatterns = [
    path('', include(router.urls)),
    path('<uuid:pk>/finalize/', SubmissionViewSet.as_view({'post': 'finalize'}), name='submission-finalize'),
]
