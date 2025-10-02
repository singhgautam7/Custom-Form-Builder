from rest_framework import viewsets, status
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction

from apps.core.utils import get_client_ip

from .models import FormSubmission, Answer
from apps.forms.models import Form, Question
from apps.ratelimit.models import SubmissionRateLimit
from apps.notifications.models import FormNotificationLog
from .serializers import SubmissionSerializer


@extend_schema(
    parameters=[
        OpenApiParameter(name='form_slug', location=OpenApiParameter.PATH, type=OpenApiTypes.STR),
        OpenApiParameter(name='pk', location=OpenApiParameter.PATH, type=OpenApiTypes.UUID),
        OpenApiParameter(name='id', location=OpenApiParameter.PATH, type=OpenApiTypes.UUID),
    ]
)
class SubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = SubmissionSerializer
    permission_classes = [AllowAny]
    lookup_field = 'pk'

    def get_queryset(self):
        form_slug = self.kwargs.get('form_slug')
        form = get_object_or_404(Form, slug=form_slug)
        return FormSubmission.objects.filter(form=form)

    def create(self, request, form_slug=None):
        form = get_object_or_404(Form, slug=form_slug)
        # expiry and active checks
        if form.is_expired() or not form.is_active:
            return Response({'detail': 'Form not accepting submissions.'}, status=status.HTTP_410_GONE)

        ip = get_client_ip(request)
        # enforce rate limit
        if form.rate_limit_enabled:
            rl, _ = SubmissionRateLimit.objects.get_or_create(form=form, ip_address=ip)
            rl.reset_if_expired(form.rate_limit_period)
            if not rl.is_within_limit(form.rate_limit_count):
                return Response({'detail': 'Rate limit exceeded.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        payload = request.data.copy()
        payload['form'] = str(form.id)
        payload['ip_address'] = ip

        # Use a DB transaction so submission + answers are atomic and rate-limit increments are consistent
        with transaction.atomic():
            serializer = self.get_serializer(data=payload)
            serializer.is_valid(raise_exception=True)
            submission = serializer.save()

            # increment rate limit
            if form.rate_limit_enabled:
                rl.increment_count()

        # if not a draft, mark completed and send notifications
        if not submission.is_draft:
            submission.completed_at = timezone.now()
            submission.save(update_fields=['completed_at'])
            if form.enable_email_notifications and form.notification_emails:
                for to in form.notification_emails:
                    try:
                        send_mail(f'New submission for {form.title}', 'A new submission was received.', settings.DEFAULT_FROM_EMAIL, [to])
                        FormNotificationLog.objects.create(form=form, submission=submission, to_email=to, success=True)
                    except Exception as e:
                        FormNotificationLog.objects.create(form=form, submission=submission, to_email=to, success=False, message=str(e))

        return Response(SubmissionSerializer(submission).data, status=status.HTTP_201_CREATED)

    @extend_schema(parameters=[OpenApiParameter(name='pk', location=OpenApiParameter.PATH, type=OpenApiTypes.UUID)])
    @action(detail=True, methods=['post'], url_path='finalize')
    def finalize(self, request, form_slug=None, pk=None):
        submission = get_object_or_404(FormSubmission, pk=pk)
        if not submission.is_draft:
            return Response({'detail': 'Submission already finalized.'}, status=status.HTTP_400_BAD_REQUEST)

        # finalize atomically and trigger notifications inside transaction to ensure consistency
        with transaction.atomic():
            submission.is_draft = False
            submission.completed_at = timezone.now()
            submission.save(update_fields=['is_draft', 'completed_at'])
            form = submission.form
            if form.enable_email_notifications and form.notification_emails:
                for to in form.notification_emails:
                    try:
                        send_mail(f'New submission for {form.title}', 'A submission was finalized.', settings.DEFAULT_FROM_EMAIL, [to])
                        FormNotificationLog.objects.create(form=form, submission=submission, to_email=to, success=True)
                    except Exception as e:
                        FormNotificationLog.objects.create(form=form, submission=submission, to_email=to, success=False, message=str(e))

        return Response(SubmissionSerializer(submission).data)
