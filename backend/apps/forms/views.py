from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Form, Question
from .serializers import FormSerializer, QuestionSerializer
from django.shortcuts import get_object_or_404
from django.utils import timezone
from apps.core.utils import get_client_ip


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
        ip = request.query_params.get('ip') or request.META.get('REMOTE_ADDR')
        from apps.ratelimit.models import SubmissionRateLimit
        try:
            rl = SubmissionRateLimit.objects.get(form=form, ip_address=ip)
            return Response({'ip': ip, 'submission_count': rl.submission_count, 'first_submission_at': rl.first_submission_at, 'last_submission_at': rl.last_submission_at, 'is_blocked': rl.is_blocked, 'blocked_until': rl.blocked_until})
        except SubmissionRateLimit.DoesNotExist:
            return Response({'ip': ip, 'submission_count': 0})

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
