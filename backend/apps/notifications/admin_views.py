from rest_framework import viewsets, permissions
from .serializers import NotificationLogSerializer
from .models import FormNotificationLog
from apps.ratelimit.models import SubmissionRateLimit
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404


class IsStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class NotificationLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FormNotificationLog.objects.all().order_by('-sent_at')
    serializer_class = NotificationLogSerializer
    permission_classes = [IsStaff]


class RateLimitAdminViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SubmissionRateLimit.objects.all().order_by('-last_submission_at')
    permission_classes = [IsStaff]

    def list(self, request):
        qs = self.get_queryset()
        data = [{'form': str(r.form.id), 'ip_address': r.ip_address, 'submission_count': r.submission_count, 'last_submission_at': r.last_submission_at} for r in qs]
        return Response(data)

    @action(detail=False, methods=['post'], url_path='reset')
    def reset(self, request):
        # admin endpoint to reset rate limits optionally by form or ip
        form_id = request.data.get('form')
        ip = request.data.get('ip')
        qs = SubmissionRateLimit.objects.all()
        if form_id:
            qs = qs.filter(form__id=form_id)
        if ip:
            qs = qs.filter(ip_address=ip)
        deleted = qs.delete()
        return Response({'deleted': deleted[0]})
