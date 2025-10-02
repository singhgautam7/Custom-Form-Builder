from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Form, Question
from .serializers import FormSerializer, QuestionSerializer
from django.shortcuts import get_object_or_404
from django.utils import timezone
from apps.core.utils import get_client_ip
from django.http import StreamingHttpResponse
import csv
import io
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError


class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return getattr(obj, 'created_by', None) == request.user


class FormViewSet(viewsets.ModelViewSet):
    queryset = Form.objects.all()
    serializer_class = FormSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'create']:
            return [permissions.IsAuthenticated()]
        if self.action in ['update', 'partial_update', 'destroy', 'update_settings', 'duplicate']:
            return [permissions.IsAuthenticated(), IsOwner()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        # list returns only user's forms
        if self.action == 'list':
            return Form.objects.filter(created_by=self.request.user)
        return super().get_queryset()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def retrieve(self, request, slug=None):
        form = get_object_or_404(Form, slug=slug)
        # check expiry
        if form.is_expired():
            return Response({'detail': 'Form expired.'}, status=status.HTTP_410_GONE)
        # password protection handled via verify-access endpoint
        serializer = self.get_serializer(form)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='client-schema')
    def client_schema(self, request, slug=None):
        """Return a lightweight client-side JSON schema useful for rendering the form.

        The schema includes question id, type, label, required, options, help_text, hint, and constraints.
        """
        form = get_object_or_404(Form, slug=slug)
        schema = {'id': str(form.id), 'title': form.title, 'description': form.description, 'questions': []}
        for q in form.questions.all():
            qschema = {
                'id': str(q.id),
                'type': q.question_type,
                'label': q.question_text,
                'required': q.is_required,
                'order': q.order,
                'placeholder': q.placeholder,
                'help_text': q.help_text,
                'hint': q.hint,
            }
            if q.options is not None:
                qschema['options'] = q.options
            # numeric constraints
            if q.min_value is not None:
                qschema['min_value'] = float(q.min_value)
            if q.max_value is not None:
                qschema['max_value'] = float(q.max_value)
            # length constraints
            if q.min_length is not None:
                qschema['min_length'] = q.min_length
            if q.max_length is not None:
                qschema['max_length'] = q.max_length
            schema['questions'].append(qschema)
        return Response(schema)

    @action(detail=True, methods=['post'])
    def duplicate(self, request, slug=None):
        form = get_object_or_404(Form, slug=slug)
        # require authenticated
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
        # copy the form
        data = FormSerializer(form).data
        data['title'] = data['title'] + ' (copy)'
        data.pop('id', None)
        data.pop('created_at', None)
        data.pop('updated_at', None)
        data['slug'] = data.get('slug') + '-copy'
        serializer = FormSerializer(data=data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        new_form = serializer.save()
        return Response(FormSerializer(new_form).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def verify_access(self, request, slug=None):
        form = get_object_or_404(Form, slug=slug)
        if not form.is_password_protected:
            return Response({'detail': 'Form is not password protected.'}, status=status.HTTP_400_BAD_REQUEST)
        code = request.data.get('code')
        if not form.check_access_code(code):
            return Response({'detail': 'Invalid access code.'}, status=status.HTTP_403_FORBIDDEN)
        return Response({'detail': 'Access granted.'})

    @action(detail=True, methods=['get'])
    def check_access(self, request, slug=None):
        form = get_object_or_404(Form, slug=slug)
        data = {'is_expired': form.is_expired(), 'rate_limited': False}
        # basic rate limit check placeholder
        ip = get_client_ip(request)
        if form.is_rate_limited(ip):
            data['rate_limited'] = True
        return Response(data)

    @action(detail=True, methods=['get'], url_path='ratelimit/status')
    def ratelimit_status(self, request, slug=None):
        form = get_object_or_404(Form, slug=slug)
        ip = request.query_params.get('ip') or get_client_ip(request)
        from apps.ratelimit.models import SubmissionRateLimit
        try:
            rl = SubmissionRateLimit.objects.get(form=form, ip_address=ip)
            return Response({'ip': ip, 'submission_count': rl.submission_count, 'first_submission_at': rl.first_submission_at, 'last_submission_at': rl.last_submission_at, 'is_blocked': rl.is_blocked, 'blocked_until': rl.blocked_until})
        except SubmissionRateLimit.DoesNotExist:
            return Response({'ip': ip, 'submission_count': 0})

    @action(detail=True, methods=['get'], url_path='submissions/report')
    def submissions_report(self, request, slug=None):
        """Return paginated submissions for a form (owner-only)."""
        form = get_object_or_404(Form, slug=slug)
        if form.created_by != request.user:
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        qs = form.submissions.filter(is_draft=False).order_by('-submitted_at')
        # simple pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 25))
        start = (page - 1) * page_size
        end = start + page_size
        items = qs[start:end]
        data = []
        for s in items:
            data.append({'id': str(s.id), 'submitted_by': str(s.submitted_by) if s.submitted_by else None, 'submitted_at': s.submitted_at, 'ip_address': s.ip_address})
        return Response({'count': qs.count(), 'page': page, 'page_size': page_size, 'results': data})

    @action(detail=True, methods=['get'], url_path='submissions/export')
    def submissions_export(self, request, slug=None):
        """Stream CSV export of submissions (owner-only)."""
        form = get_object_or_404(Form, slug=slug)
        if form.created_by != request.user:
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        qs = form.submissions.filter(is_draft=False).order_by('submitted_at')

        def row_generator():
            buf = io.StringIO()
            writer = csv.writer(buf)
            # header
            writer.writerow(['submission_id', 'submitted_by', 'submitted_at', 'ip_address'])
            yield buf.getvalue()
            buf.seek(0)
            buf.truncate(0)
            for s in qs:
                writer.writerow([str(s.id), str(s.submitted_by) if s.submitted_by else '', s.submitted_at.isoformat() if s.submitted_at else '', s.ip_address or ''])
                yield buf.getvalue()
                buf.seek(0)
                buf.truncate(0)

        return StreamingHttpResponse(row_generator(), content_type='text/csv')

    @action(detail=True, methods=['post'], url_path='ratelimit/reset')
    def ratelimit_reset(self, request, slug=None):
        form = get_object_or_404(Form, slug=slug)
        # owner-only
        if form.created_by != request.user:
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        ip = request.data.get('ip')
        from apps.ratelimit.models import SubmissionRateLimit
        qs = SubmissionRateLimit.objects.filter(form=form)
        if ip:
            qs = qs.filter(ip_address=ip)
        updated = qs.delete()
        return Response({'detail': 'Rate limits reset', 'deleted': updated[0]})

    @action(detail=True, methods=['patch'], url_path='settings')
    def update_settings(self, request, slug=None):
        form = get_object_or_404(Form, slug=slug)
        if form.created_by != request.user:
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        allowed = ['is_active', 'allow_multiple_submissions', 'expires_at', 'rate_limit_enabled', 'rate_limit_count', 'rate_limit_period', 'is_password_protected', 'access_code']
        for k, v in request.data.items():
            if k not in allowed:
                return Response({'detail': f'Field {k} not allowed'}, status=status.HTTP_400_BAD_REQUEST)
            setattr(form, k, v)
        form.save()
        return Response(FormSerializer(form).data)


class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer
    lookup_field = 'id'

    def get_queryset(self):
        form_slug = self.kwargs.get('form_slug')
        form = get_object_or_404(Form, slug=form_slug)
        return form.questions.all()

    def perform_create(self, serializer):
        form_slug = self.kwargs.get('form_slug')
        form = get_object_or_404(Form, slug=form_slug)
        # check owner
        if form.created_by != self.request.user:
            raise PermissionError('Not owner')
        serializer.save(form=form)

    @action(detail=False, methods=['patch'])
    def reorder(self, request, form_slug=None):
        form = get_object_or_404(Form, slug=form_slug)
        if form.created_by != request.user:
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        order = request.data.get('order', [])
        if not isinstance(order, list):
            return Response({'detail': 'Order must be a list of question IDs'}, status=status.HTTP_400_BAD_REQUEST)
        # validate
        ids = [str(q.id) for q in form.questions.all()]
        if set(ids) != set([str(i) for i in order]):
            return Response({'detail': 'IDs mismatch'}, status=status.HTTP_400_BAD_REQUEST)
        # apply new order
        for idx, qid in enumerate(order, start=1):
            q = form.questions.get(id=qid)
            q.order = idx
            q.save()
        return Response({'detail': 'Reordered'})

    @action(detail=True, methods=['post'], url_path='validate')
    def validate_answer(self, request, form_slug=None, id=None):
        """Validate a single answer payload against the question rules.

        Expected payloads vary by question type, e.g.:
        - text/email: {"answer_text": "..."}
        - number: {"answer_number": 123}
        - date: {"answer_date": "2025-10-03"}
        - checkbox/multiselect: {"answer_choices": [..]}
        """
        form = get_object_or_404(Form, slug=form_slug)
        question = get_object_or_404(Question, id=id, form=form)
        # pick the value out of request.data according to question type
        payload = request.data
        try:
            if question.question_type in ('text', 'textarea', 'email'):
                val = payload.get('answer_text')
            elif question.question_type == 'number':
                val = payload.get('answer_number')
            elif question.question_type == 'date':
                val = payload.get('answer_date')
            elif question.question_type in ('dropdown', 'radio'):
                val = payload.get('answer_text')
            elif question.question_type in ('checkbox', 'multiselect'):
                val = payload.get('answer_choices')
            else:
                val = payload.get('answer_text')

            question.validate_answer(val)
        except DjangoValidationError as e:
            raise DRFValidationError(e.message_dict if hasattr(e, 'message_dict') else e.messages)
        return Response({'detail': 'Valid'})
