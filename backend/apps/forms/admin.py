from django.contrib import admin
from django import forms
from django.core.exceptions import ValidationError
from .models import Form, Question
from strings import QUESTION_OPTIONS_HELP


class QuestionAdminForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        qt = None
        # Prefer bound form data (when changing the type in the admin UI), then instance, then initial
        if self.data and self.data.get('question_type'):
            qt = self.data.get('question_type')
        elif self.instance and getattr(self.instance, 'question_type', None):
            qt = self.instance.question_type
        elif 'question_type' in self.initial:
            qt = self.initial.get('question_type')
        if qt:
            self.fields['options'].help_text = QUESTION_OPTIONS_HELP.get(qt, '')

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


@admin.register(Form)
class FormAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'created_by', 'is_active', 'is_template', 'created_at')
    search_fields = ('title', 'created_by__username')


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    form = QuestionAdminForm
    list_display = ('id', 'form', 'order', 'question_type', 'is_required')
    list_filter = ('question_type',)
    search_fields = ('question_text',)

    class Media:
        js = ('apps/forms/question_options_help.js',)
