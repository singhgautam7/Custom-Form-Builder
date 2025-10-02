from rest_framework import serializers
from .models import FormNotificationLog


class NotificationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormNotificationLog
        fields = '__all__'
