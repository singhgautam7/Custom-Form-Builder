import uuid
from django.db import models


class SubmissionRateLimit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    form = models.ForeignKey('forms.Form', on_delete=models.CASCADE, related_name='rate_limits')
    ip_address = models.GenericIPAddressField()
    submission_count = models.PositiveIntegerField(default=0)
    first_submission_at = models.DateTimeField(auto_now_add=True)
    last_submission_at = models.DateTimeField(auto_now=True)
    is_blocked = models.BooleanField(default=False)
    blocked_until = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['form', 'ip_address']
        indexes = [models.Index(fields=['form', 'ip_address', 'last_submission_at'])]

    def increment_count(self):
        self.submission_count = models.F('submission_count') + 1
        self.save(update_fields=['submission_count', 'last_submission_at'])

    def reset_if_expired(self, rate_limit_period):
        from django.utils import timezone
        if (timezone.now() - self.first_submission_at).total_seconds() > rate_limit_period:
            self.submission_count = 0
            self.first_submission_at = timezone.now()
            self.save(update_fields=['submission_count', 'first_submission_at'])

    def is_within_limit(self, max_count):
        return self.submission_count < max_count

    def __str__(self):
        return f"RateLimit {self.form} @ {self.ip_address} -> {self.submission_count}"
