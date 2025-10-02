from django.contrib import admin
from django import forms
from django.core.exceptions import ValidationError
from .models import Form, Question


@admin.action(description='Delete non-draft submissions for selected forms')
def reset_submissions(modeladmin, request, queryset):
    for form in queryset:
        form.submissions.filter(is_draft=False).delete()


@admin.action(description='Clear submission limit for selected forms')
def clear_submission_limit(modeladmin, request, queryset):
    queryset.update(submission_limit=None)


@admin.register(Form)
class FormAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by', 'is_published', 'submission_limit', 'created_at')
    list_filter = ('is_published',)
    search_fields = ('title', 'slug')
    actions = [reset_submissions, clear_submission_limit]


class QuestionAdminForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = '__all__'

    def clean(self):
        cleaned = super().clean()
        # apply cleaned data onto the instance then run model validation
        for attr, val in cleaned.items():
            setattr(self.instance, attr, val)
        try:
            self.instance.full_clean()
        except ValidationError as e:
            # translate model ValidationError into form ValidationError
            raise forms.ValidationError(e.message_dict or e.messages)
        return cleaned


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    form = QuestionAdminForm
    list_display = ('id', 'form', 'order', 'question_type', 'is_required')
    list_filter = ('question_type',)
    search_fields = ('question_text',)

    class Media:
        js = ('apps/forms/question_options_help.js',)
