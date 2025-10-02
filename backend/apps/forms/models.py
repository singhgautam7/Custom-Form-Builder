import uuid
import datetime
from decimal import Decimal, InvalidOperation

from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator


class Form(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_template = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    allow_multiple_submissions = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    slug = models.SlugField(unique=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_password_protected = models.BooleanField(default=False)
    access_code = models.CharField(max_length=255, blank=True, null=True)
    enable_email_notifications = models.BooleanField(default=False)
    notification_emails = models.JSONField(default=list, blank=True)
    rate_limit_enabled = models.BooleanField(default=True)
    rate_limit_count = models.PositiveIntegerField(default=5)
    rate_limit_period = models.PositiveIntegerField(default=3600)
    allow_partial_saves = models.BooleanField(default=True)

    def __str__(self):
        return self.title

    def is_expired(self):
        if not self.expires_at:
            return False
        return timezone.now() > self.expires_at

    def set_access_code(self, raw_code):
        self.access_code = make_password(raw_code)
        self.save(update_fields=['access_code'])

    def check_access_code(self, code):
        if not self.is_password_protected or not self.access_code:
            return True
        return check_password(code, self.access_code)

    def is_rate_limited(self, ip_address):
        # minimal check placeholder; actual implementation should query SubmissionRateLimit
        from apps.ratelimit.models import SubmissionRateLimit
        if not self.rate_limit_enabled:
            return False
        try:
            entry = SubmissionRateLimit.objects.get(form=self, ip_address=ip_address)
        except SubmissionRateLimit.DoesNotExist:
            return False
        return not entry.is_within_limit(self.rate_limit_count)


class Question(models.Model):
    QUESTION_TYPES = [
        ('text', 'Text'),
        ('email', 'Email'),
        ('number', 'Number'),
        ('date', 'Date'),
        ('textarea', 'Textarea'),
        ('radio', 'Radio'),
        ('checkbox', 'Checkbox'),
        ('dropdown', 'Dropdown'),
        ('multiselect', 'Multi-select'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=50, choices=QUESTION_TYPES)
    is_required = models.BooleanField(default=False)
    order = models.PositiveIntegerField()
    placeholder = models.CharField(max_length=255, blank=True, null=True)
    min_length = models.PositiveIntegerField(null=True, blank=True)
    max_length = models.PositiveIntegerField(null=True, blank=True)
    min_value = models.DecimalField(null=True, blank=True, max_digits=10, decimal_places=2)
    max_value = models.DecimalField(null=True, blank=True, max_digits=10, decimal_places=2)
    options = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']
        unique_together = ['form', 'order']

    def __str__(self):
        return f"{self.form.title} - Q{self.order}: {self.question_text[:50]}"

    def clean(self):
        """Validate the options JSON and field consistency depending on question_type."""
        # validate options based on question type
        qt = self.question_type
        opts = self.options

        if qt in ('dropdown', 'radio', 'checkbox', 'multiselect'):
            if not opts:
                raise ValidationError({'options': 'Options JSON is required for choice fields (list of values).'} )
            if not isinstance(opts, list):
                raise ValidationError({'options': 'Options must be a list of strings or objects with label/value.'})
            if len(opts) == 0:
                raise ValidationError({'options': 'Options list cannot be empty.'})
            # validate each option
            for i, o in enumerate(opts):
                if isinstance(o, dict):
                    if 'label' not in o or 'value' not in o:
                        raise ValidationError({'options': f'Option at index {i} must contain "label" and "value" keys.'})
                elif not isinstance(o, (str, int)):
                    raise ValidationError({'options': f'Option at index {i} must be a string, int, or an object with label/value.'})

        if qt == 'date' and opts is not None:
            if not isinstance(opts, dict):
                raise ValidationError({'options': 'Date options must be an object with allow_past/min_date/max_date.'})
            # allow_past: bool
            if 'allow_past' in opts and not isinstance(opts['allow_past'], bool):
                raise ValidationError({'options': 'allow_past must be a boolean.'})
            for key in ('min_date', 'max_date'):
                if key in opts and opts[key] is not None:
                    try:
                        datetime.date.fromisoformat(opts[key])
                    except Exception:
                        raise ValidationError({'options': f'{key} must be a date string in YYYY-MM-DD format.'})
            if 'min_date' in opts and 'max_date' in opts and opts['min_date'] and opts['max_date']:
                if datetime.date.fromisoformat(opts['min_date']) > datetime.date.fromisoformat(opts['max_date']):
                    raise ValidationError({'options': 'min_date cannot be after max_date.'})

        if qt == 'number':
            # ensure min_value and max_value are consistent if provided
            if self.min_value is not None and self.max_value is not None:
                try:
                    if Decimal(self.min_value) > Decimal(self.max_value):
                        raise ValidationError({'min_value': 'min_value cannot be greater than max_value.'})
                except (InvalidOperation, TypeError):
                    raise ValidationError({'min_value': 'min_value and max_value must be valid decimals.'})

        # email type: no complex options but you can supply pattern in options; ensure it's a dict if provided
        if qt == 'email' and opts is not None and not isinstance(opts, dict):
            raise ValidationError({'options': 'Email options must be an object (for example {"pattern": "..."}).'})

    def validate_answer(self, value):
        """Runtime validator for an answer value according to question_type. Returns None or raises ValidationError."""
        qt = self.question_type
        if qt == 'email':
            v = EmailValidator()
            try:
                v(value)
            except Exception as e:
                raise ValidationError(f'Invalid email: {e}')

        if qt == 'number':
            try:
                num = Decimal(str(value))
            except Exception:
                raise ValidationError('Answer must be a number.')
            if self.min_value is not None and num < self.min_value:
                raise ValidationError(f'Number is below minimum of {self.min_value}.')
            if self.max_value is not None and num > self.max_value:
                raise ValidationError(f'Number is above maximum of {self.max_value}.')

        if qt == 'date':
            try:
                if isinstance(value, str):
                    d = datetime.date.fromisoformat(value)
                elif isinstance(value, datetime.date):
                    d = value
                else:
                    raise ValueError()
            except Exception:
                raise ValidationError('Invalid date format, expected YYYY-MM-DD or date object.')
            opts = self.options or {}
            if not opts.get('allow_past', True) and d < datetime.date.today():
                raise ValidationError('Past dates are not allowed for this question.')
            if 'min_date' in opts and opts.get('min_date'):
                if d < datetime.date.fromisoformat(opts['min_date']):
                    raise ValidationError(f'Date is before allowed minimum {opts["min_date"]}.')
            if 'max_date' in opts and opts.get('max_date'):
                if d > datetime.date.fromisoformat(opts['max_date']):
                    raise ValidationError(f'Date is after allowed maximum {opts["max_date"]}.')

        if qt in ('dropdown', 'radio'):
            opts = self.options or []
            values = [o['value'] if isinstance(o, dict) else o for o in opts]
            if value not in values:
                raise ValidationError('Selected value is not a valid option.')

        if qt in ('checkbox', 'multiselect'):
            # expect value to be a list of choices
            if not isinstance(value, (list, tuple)):
                raise ValidationError('Answer must be a list of selected options.')
            opts = self.options or []
            values = [o['value'] if isinstance(o, dict) else o for o in opts]
            for v in value:
                if v not in values:
                    raise ValidationError(f'Selected value {v} is not a valid option.')
