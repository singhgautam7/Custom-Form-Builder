from django.urls import path
from .views import RegisterView, LoginView, TokenRefreshView, VerifyEmailView, ResendVerificationView, LogoutView, CurrentUserView
from rest_framework_simplejwt.views import TokenRefreshView as SimpleJWTTokenRefresh

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('token/refresh/', SimpleJWTTokenRefresh.as_view(), name='token_refresh'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('resend-verification/', ResendVerificationView.as_view(), name='resend-verification'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('me/', CurrentUserView.as_view(), name='auth-me'),
]
