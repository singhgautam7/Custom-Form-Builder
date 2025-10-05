from rest_framework import serializers
from .models import FormSubmission, Answer
from apps.forms.models import Question


class AnswerSerializer(serializers.ModelSerializer):
    question = serializers.UUIDField()

    class Meta:
        model = Answer
        fields = ('id', 'question', 'answer_text', 'answer_number', 'answer_date', 'answer_choices')

    def validate(self, data):
        # fetch question and use its runtime validator
        try:
            q = Question.objects.get(id=data['question'])
        except Question.DoesNotExist:
            raise serializers.ValidationError({'question': 'Invalid question id'})
        # normalize value based on type
        value = None
        if q.question_type in ('text', 'textarea', 'email'):
            value = data.get('answer_text')
        elif q.question_type == 'number':
            value = data.get('answer_number')
        elif q.question_type == 'date':
            value = data.get('answer_date')
        elif q.question_type in ('dropdown', 'radio'):
            value = data.get('answer_text')
        elif q.question_type in ('checkbox', 'multiselect'):
            value = data.get('answer_choices')
        # delegate validation
        q.validate_answer(value)
        return data


class SubmissionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True)
    submitted_by_email = serializers.SerializerMethodField()
    submitted_by_name = serializers.SerializerMethodField()

    class Meta:
        model = FormSubmission
        fields = (
            'id', 'form', 'submitted_by', 'submitted_at', 'ip_address', 'is_draft',
            'completed_at', 'last_saved_at', 'answers', 'submitted_by_email', 'submitted_by_name'
        )
        read_only_fields = ('id', 'submitted_at', 'last_saved_at', 'completed_at')

    def create(self, validated_data):
        answers = validated_data.pop('answers', [])
        submission = FormSubmission.objects.create(**validated_data)
        for a in answers:
            Answer.objects.create(submission=submission, question_id=a['question'], answer_text=a.get('answer_text'), answer_number=a.get('answer_number'), answer_date=a.get('answer_date'), answer_choices=a.get('answer_choices'))
        return submission

    def get_submitted_by_email(self, obj):
        # submitted_by is a FK to user; return email when available
        user = obj.submitted_by
        if user is None:
            return None
        # Some user models may not have 'email' — guard access
        return getattr(user, 'email', None) or None

    def get_submitted_by_name(self, obj):
        user = obj.submitted_by
        if user is None:
            return None
        # Try full name fields then username
        name = None
        if getattr(user, 'get_full_name', None):
            try:
                name = user.get_full_name()
            except Exception:
                name = None
        name = name or getattr(user, 'full_name', None) or getattr(user, 'display_name', None) or getattr(user, 'username', None) or None
        return name
