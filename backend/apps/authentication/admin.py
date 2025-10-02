from django.contrib import admin
from .models import EmailVerification


@admin.register(EmailVerification)
class EmailVerificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'is_verified', 'created_at', 'verified_at')
    search_fields = ('user__username', 'user__email')
