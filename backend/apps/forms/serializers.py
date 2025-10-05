from rest_framework import serializers
from .models import Form, Question
from django.utils import timezone
from django.utils.text import slugify
import uuid


class QuestionSerializer(serializers.ModelSerializer):
    form = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Question
        exclude = ()
        read_only_fields = ('id', 'created_at', 'updated_at', 'form')

    def validate(self, data):
        # Use the model's clean() logic to validate options and consistency
        # Create a transient Question object to run validation
        obj = Question(**{**data})
        try:
            obj.clean()
        except Exception as e:
            # If it's a Django ValidationError, convert to DRF ValidationError
            from django.core.exceptions import ValidationError as DjangoValidationError
            from rest_framework.exceptions import ValidationError as DRFValidationError
            if isinstance(e, DjangoValidationError):
                raise DRFValidationError(e.message_dict if hasattr(e, 'message_dict') else e.messages)
            raise
        return data


class FormSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, required=False)
    created_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Form
        fields = ('id', 'title', 'description', 'created_by', 'is_template', 'is_active', 'allow_multiple_submissions',
                  'is_published', 'submission_limit',
                  'created_at', 'updated_at', 'slug', 'expires_at', 'is_password_protected', 'access_code',
                  'enable_email_notifications', 'notification_emails', 'rate_limit_enabled', 'rate_limit_count',
                  'rate_limit_period', 'allow_partial_saves', 'questions')
        # slug is generated server-side; make it read-only so clients don't need to supply it
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at', 'slug')

    def validate(self, data):
        # slug uniqueness handled by model
        return data

    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        request = self.context.get('request')
        user = request.user
        validated_data['created_by'] = user
        # Ensure a slug exists; if not provided, generate one from title and make it unique
        if not validated_data.get('slug'):
            base = slugify(validated_data.get('title', 'form')) or 'form'
            candidate = base
            # append short uuid suffix on collisions
            while Form.objects.filter(slug=candidate).exists():
                candidate = f"{base}-{uuid.uuid4().hex[:6]}"
            validated_data['slug'] = candidate

        form = Form.objects.create(**validated_data)
        for q in questions_data:
            Question.objects.create(form=form, **q)
        return form

    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions', None)
        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        if questions_data is not None:
            # simple strategy: remove existing and recreate
            instance.questions.all().delete()
            for q in questions_data:
                Question.objects.create(form=instance, **q)
        return instance
