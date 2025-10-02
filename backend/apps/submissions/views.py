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
from apps.notifications.tasks import dispatch_notification


@extend_schema(
    parameters=[
        OpenApiParameter(name='form_slug', location=OpenApiParameter.PATH, type=OpenApiTypes.STR),
        OpenApiParameter(name='id', location=OpenApiParameter.PATH, type=OpenApiTypes.UUID),
    ]
)
class SubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = SubmissionSerializer
    permission_classes = [AllowAny]
    lookup_field = 'id'

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

        # enforce submission cap if set
        if form.submission_limit is not None:
            current_count = form.submissions.filter(is_draft=False).count()
            if current_count >= form.submission_limit:
                return Response({'detail': 'Submission limit reached for this form.'}, status=status.HTTP_403_FORBIDDEN)

        payload = request.data.copy()
        payload['form'] = str(form.id)
        payload['ip_address'] = ip

        # Use a DB transaction and lock the Form row to enforce submission_limit safely under concurrency
        with transaction.atomic():
            locked_form = Form.objects.select_for_update().get(id=form.id)
            # re-check submission cap under lock
            if locked_form.submission_limit is not None:
                current_count = locked_form.submissions.filter(is_draft=False).count()
                if current_count >= locked_form.submission_limit:
                    return Response({'detail': 'Submission limit reached for this form.'}, status=status.HTTP_403_FORBIDDEN)

            serializer = self.get_serializer(data=payload)
            serializer.is_valid(raise_exception=True)
            submission = serializer.save()

            # increment rate limit
            if locked_form.rate_limit_enabled:
                rl.increment_count()

        # if not a draft, mark completed and send notifications
        if not submission.is_draft:
            submission.completed_at = timezone.now()
            submission.save(update_fields=['completed_at'])
            if form.enable_email_notifications and form.notification_emails:
                def _notify():
                    for to in form.notification_emails:
                        dispatch_notification(form, submission, f'New submission for {form.title}', 'A new submission was received.', to)

                transaction.on_commit(_notify)

        return Response(SubmissionSerializer(submission).data, status=status.HTTP_201_CREATED)

    @extend_schema(parameters=[OpenApiParameter(name='id', location=OpenApiParameter.PATH, type=OpenApiTypes.UUID)])
    @action(detail=True, methods=['post'], url_path='finalize')
    def finalize(self, request, form_slug=None, id=None):
        submission = get_object_or_404(FormSubmission, id=id)
        if not submission.is_draft:
            return Response({'detail': 'Submission already finalized.'}, status=status.HTTP_400_BAD_REQUEST)

        # finalize atomically and trigger notifications inside transaction to ensure consistency
        with transaction.atomic():
            submission.is_draft = False
            submission.completed_at = timezone.now()
            submission.save(update_fields=['is_draft', 'completed_at'])
            form = submission.form
            if form.enable_email_notifications and form.notification_emails:
                def _notify_finalize():
                    for to in form.notification_emails:
                        dispatch_notification(form, submission, f'New submission for {form.title}', 'A submission was finalized.', to)

                transaction.on_commit(_notify_finalize)

        return Response(SubmissionSerializer(submission).data)
