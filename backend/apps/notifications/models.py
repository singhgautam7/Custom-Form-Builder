import uuid
from django.db import models


class FormNotificationLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    form = models.ForeignKey('forms.Form', on_delete=models.CASCADE, related_name='notification_logs')
    submission = models.ForeignKey('submissions.FormSubmission', on_delete=models.CASCADE, related_name='notification_logs')
    to_email = models.EmailField()
    sent_at = models.DateTimeField(auto_now_add=True)
    success = models.BooleanField(default=True)
    message = models.TextField(blank=True)

    def __str__(self):
        return f"Notification to {self.to_email} for {self.form}"
