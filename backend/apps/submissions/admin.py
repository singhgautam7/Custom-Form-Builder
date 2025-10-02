from django.contrib import admin
from .models import FormSubmission, Answer


@admin.register(FormSubmission)
class FormSubmissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'form', 'submitted_by', 'submitted_at', 'ip_address', 'is_draft')
    list_filter = ('is_draft',)


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('id', 'submission', 'question', 'created_at')
    search_fields = ('question__question_text', 'answer_text')
