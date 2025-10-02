from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import EmailVerification
from rest_framework import status

User = get_user_model()


class AuthenticationTests(APITestCase):
    def test_register_and_verify_and_login(self):
        url = reverse('auth-register')
        data = {'username': 'alice', 'email': 'alice@example.com', 'password': 'StrongPassw0rd!', 'password2': 'StrongPassw0rd!'}
        resp = self.client.post(url, data)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username='alice')
        ev = EmailVerification.objects.get(user=user)
        # verify email
        vurl = reverse('verify-email')
        resp = self.client.post(vurl, {'token': ev.verification_token})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        ev.refresh_from_db()
        self.assertTrue(ev.is_verified)
        # login
        lurl = reverse('auth-login')
        resp = self.client.post(lurl, {'username': 'alice', 'password': 'StrongPassw0rd!'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('access', resp.data)

    def test_resend_verification(self):
        user = User.objects.create(username='bob', email='bob@example.com')
        user.set_password('StrongPassw0rd!')
        user.save()
        url = reverse('resend-verification')
        resp = self.client.post(url, {'email': 'bob@example.com'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_current_user_requires_auth(self):
        url = reverse('auth-me')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
