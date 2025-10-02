import uuid
from django.db import models
from django.conf import settings


class FormSubmission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    form = models.ForeignKey('forms.Form', on_delete=models.CASCADE, related_name='submissions')
    submitted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    is_draft = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_saved_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=['form', 'ip_address', 'submitted_at'])]

    def __str__(self):
        return f"Submission {self.id} for {self.form}"


class Answer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.ForeignKey(FormSubmission, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey('forms.Question', on_delete=models.CASCADE)
    answer_text = models.TextField(null=True, blank=True)
    answer_number = models.DecimalField(null=True, blank=True, max_digits=10, decimal_places=2)
    answer_date = models.DateField(null=True, blank=True)
    answer_choices = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['submission', 'question']

    def __str__(self):
        return f"Answer {self.id} for {self.question}"
