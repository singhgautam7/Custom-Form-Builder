from rest_framework.routers import DefaultRouter
from .views import FormViewSet, QuestionViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'forms', FormViewSet, basename='form')

question_list = QuestionViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

question_detail = QuestionViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

urlpatterns = [
    path('', include(router.urls)),
    path('forms/<slug:form_slug>/questions/', question_list, name='question-list'),
    path('forms/<slug:form_slug>/questions/<uuid:id>/', question_detail, name='question-detail'),
    path('forms/<slug:form_slug>/questions/reorder/', QuestionViewSet.as_view({'patch': 'reorder'}), name='question-reorder'),
    path('forms/<slug:form_slug>/submissions/', include('apps.submissions.urls')),
]
