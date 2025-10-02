from rest_framework import serializers
from .models import Form, Question
from django.utils import timezone


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        exclude = ()
        read_only_fields = ('id', 'created_at', 'updated_at')


class FormSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, required=False)
    created_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Form
        fields = ('id', 'title', 'description', 'created_by', 'is_template', 'is_active', 'allow_multiple_submissions',
                  'created_at', 'updated_at', 'slug', 'expires_at', 'is_password_protected', 'access_code',
                  'enable_email_notifications', 'notification_emails', 'rate_limit_enabled', 'rate_limit_count',
                  'rate_limit_period', 'allow_partial_saves', 'questions')
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at')

    def validate(self, data):
        # slug uniqueness handled by model
        return data

    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        request = self.context.get('request')
        user = request.user
        validated_data['created_by'] = user
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
