from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from django.db.models.functions import TruncDate
from apps.forms.models import Form
from apps.submissions.models import FormSubmission
from .models import FormViewEvent

class AnalyticsSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)
        seven_days_ago = now - timedelta(days=7)

        # Aggregate Total Forms
        forms = Form.objects.filter(created_by=user)
        total_forms = forms.count()

        # Aggregate Total Submissions
        total_submissions = FormSubmission.objects.filter(form__created_by=user).count()
        recent_submissions = FormSubmission.objects.filter(
            form__created_by=user,
            submitted_at__gte=seven_days_ago
        ).count()

        # Active Views
        active_views = FormViewEvent.objects.filter(
            form__created_by=user,
            viewed_at__gte=thirty_days_ago
        ).count()

        # Submission trend (last 7 days)
        trend_qs = FormSubmission.objects.filter(
            form__created_by=user,
            submitted_at__gte=seven_days_ago
        ).annotate(date=TruncDate('submitted_at')).values('date').annotate(count=Count('id')).order_by('date')

        # Build 7-day array
        trend = []
        for i in range(7):
            day = (now - timedelta(days=6-i)).date()
            day_count = next((item['count'] for item in trend_qs if item['date'] == day), 0)
            trend.append({
                "name": day.strftime("%a"),
                "submissions": day_count
            })

        # Recent Activity (last 5 submissions)
        recent_submission_objs = FormSubmission.objects.filter(
            form__created_by=user
        ).select_related('form', 'submitted_by').order_by('-submitted_at')[:5]

        recent_activity_list = []
        for sub in recent_submission_objs:
            recent_activity_list.append({
                "id": str(sub.id),
                "form_title": sub.form.title,
                "submitter": sub.submitted_by.email if sub.submitted_by else sub.ip_address or "Anonymous",
                "submitted_at": sub.submitted_at.isoformat()
            })

        return Response({
            "total_forms": total_forms,
            "total_submissions": total_submissions,
            "active_views": active_views,
            "recent_submissions": recent_submissions,
            "submission_trend": trend,
            "recent_activity": recent_activity_list
        })
