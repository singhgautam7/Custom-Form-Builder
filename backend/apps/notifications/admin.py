from django.contrib import admin
from .models import FormNotificationLog
from apps.ratelimit.models import SubmissionRateLimit


@admin.register(FormNotificationLog)
class FormNotificationLogAdmin(admin.ModelAdmin):
    list_display = ('to_email', 'form', 'submission', 'sent_at', 'success')
    list_filter = ('success', 'form', 'sent_at')
    search_fields = ('to_email', 'message')


@admin.register(SubmissionRateLimit)
class SubmissionRateLimitAdmin(admin.ModelAdmin):
    list_display = ('form', 'ip_address', 'submission_count', 'first_submission_at', 'last_submission_at', 'is_blocked', 'blocked_until')
    list_filter = ('form', 'is_blocked')
    search_fields = ('ip_address',)
