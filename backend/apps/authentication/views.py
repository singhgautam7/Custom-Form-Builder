from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import GenericAPIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    CurrentUserSerializer,
    EmailSerializer,
    VerifySerializer,
    RefreshSerializer,
)
from .models import EmailVerification
from django.utils import timezone
import uuid
from django.core.mail import send_mail
from django.conf import settings
from django_ratelimit.decorators import ratelimit

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    @ratelimit(key='ip', rate=lambda request: settings.RATE_LIMIT_REGISTER, block=True)
    def create(self, request, *args, **kwargs):
        resp = super().create(request, *args, **kwargs)
        user = User.objects.get(pk=resp.data['id'])
        # create email verification token
        token = uuid.uuid4().hex
        EmailVerification.objects.create(user=user, verification_token=token)
        # Send verification email (development: console backend)
        verification_link = f"verify-token:{token}"
        subject = 'Verify your email'
        body = f"Hi {user.username},\n\nUse this token to verify your email: {token}\n\nOr visit: {verification_link}\n"
        send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [user.email])
        return Response({'detail': 'User created. Verification email sent.'}, status=status.HTTP_201_CREATED)


class LoginView(GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer
    @ratelimit(key='ip', rate=lambda request: settings.RATE_LIMIT_LOGIN, block=True)
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({'refresh': str(refresh), 'access': str(refresh.access_token)})


class TokenRefreshView(TokenRefreshView):
    pass


class VerifyEmailView(GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = VerifySerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data['token']
        try:
            ev = EmailVerification.objects.get(verification_token=token)
        except EmailVerification.DoesNotExist:
            return Response({'detail': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)
        ev.is_verified = True
        ev.verified_at = timezone.now()
        ev.save()
        return Response({'detail': 'Email verified.'})


class ResendVerificationView(GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = EmailSerializer
    @ratelimit(key='ip', rate=lambda request: settings.RATE_LIMIT_RESEND_VERIFICATION, block=True)
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        ev, _ = EmailVerification.objects.get_or_create(user=user)
        if ev.is_verified:
            return Response({'detail': 'Email already verified.'}, status=status.HTTP_400_BAD_REQUEST)
        # regenerate token
        ev.verification_token = uuid.uuid4().hex
        ev.is_verified = False
        ev.verified_at = None
        ev.save()
        # send email
        subject = 'Verify your email (resend)'
        body = f"Hi {user.username},\n\nUse this token to verify your email: {ev.verification_token}\n"
        send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [user.email])
        return Response({'detail': 'Verification resent.'})


class LogoutView(GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = RefreshSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        refresh = serializer.validated_data['refresh']
        try:
            token = RefreshToken(refresh)
            token.blacklist()
        except Exception:
            return Response({'detail': 'Invalid refresh token.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'detail': 'Logged out.'})


class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = CurrentUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
