"""Notification dispatch utilities.

Prefer Celery-backed tasks if Celery is installed and configured. Fall back
to an in-process ThreadPoolExecutor for development/testing environments where
Celery/Redis may not be available.
"""
from django.core.mail import send_mail
from django.conf import settings
from .models import FormNotificationLog


try:  # pragma: no cover - optional dependency
    from celery import shared_task

    @shared_task(bind=True, acks_late=True)
    def send_notification_email(self, form_id, submission_id, subject, body, to_email):
        from apps.forms.models import Form
        from apps.submissions.models import FormSubmission

        try:
            form = Form.objects.get(id=form_id)
            submission = FormSubmission.objects.get(id=submission_id)
        except Exception as e:
            FormNotificationLog.objects.create(form_id=form_id, submission_id=submission_id, to_email=to_email, success=False, message=str(e))
            return {'status': 'missing', 'error': str(e)}

        try:
            send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [to_email])
            FormNotificationLog.objects.create(form=form, submission=submission, to_email=to_email, success=True)
            return {'status': 'sent'}
        except Exception as e:
            FormNotificationLog.objects.create(form=form, submission=submission, to_email=to_email, success=False, message=str(e))
            raise

    def dispatch_notification(form, submission, subject, body, to_email):
        send_notification_email.delay(str(form.id), str(submission.id), subject, body, to_email)

except Exception:  # Celery not available — fallback
    from concurrent.futures import ThreadPoolExecutor

    _executor = ThreadPoolExecutor(max_workers=4)


    def _send_and_log(form, submission, subject, body, to_email):
        try:
            send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [to_email])
            FormNotificationLog.objects.create(form=form, submission=submission, to_email=to_email, success=True)
        except Exception as e:
            FormNotificationLog.objects.create(form=form, submission=submission, to_email=to_email, success=False, message=str(e))


    def dispatch_notification(form, submission, subject, body, to_email):
        _executor.submit(_send_and_log, form, submission, subject, body, to_email)
