from django.db import models
from apps.forms.models import Form

class FormViewEvent(models.Model):
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name='view_events')
    viewed_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"View for {self.form.title} at {self.viewed_at}"
