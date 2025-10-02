from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from django.utils import timezone
from apps.forms.models import Form, Question
from django.contrib.auth import get_user_model
import json

User = get_user_model()


class SubmissionFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='owner', email='owner@example.com', password='pw')
        # create a form
        self.form = Form.objects.create(title='T', description='D', created_by=self.user, slug='t-form', is_active=True, allow_partial_saves=True, rate_limit_enabled=True, rate_limit_count=2, rate_limit_period=3600)
        # question: simple text
        self.q = Question.objects.create(form=self.form, question_text='Your name', question_type='text', is_required=True, order=1)

    def test_create_submission_and_finalize(self):
        url = reverse('form-list')  # to ensure router loaded
        # create a final submission
        data = {
            'is_draft': False,
            'answers': [
                {'question': str(self.q.id), 'answer_text': 'Gautam'}
            ]
        }
        resp = self.client.post(f'/api/forms/{self.form.slug}/submissions/', data=json.dumps(data), content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        j = resp.json()
        self.assertIn('id', j)

    def test_draft_and_finalize(self):
        data = {'is_draft': True, 'answers': [{'question': str(self.q.id), 'answer_text': 'Draft'}]}
        resp = self.client.post(f'/api/forms/{self.form.slug}/submissions/', data=json.dumps(data), content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        sid = resp.json()['id']
        # finalize
        resp2 = self.client.post(f'/api/forms/{self.form.slug}/submissions/{sid}/finalize/')
        self.assertEqual(resp2.status_code, 200)

    def test_rate_limit_exceeded(self):
        data = {'is_draft': False, 'answers': [{'question': str(self.q.id), 'answer_text': '1'}]}
        for i in range(2):
            resp = self.client.post(f'/api/forms/{self.form.slug}/submissions/', data=json.dumps(data), content_type='application/json')
            self.assertEqual(resp.status_code, 201)
        # third submission should fail (rate_limit_count=2)
        resp3 = self.client.post(f'/api/forms/{self.form.slug}/submissions/', data=json.dumps(data), content_type='application/json')
        self.assertEqual(resp3.status_code, 429)

    def test_export_csv_and_report(self):
        # bump rate limit so export can create multiple submissions
        self.form.rate_limit_count = 10
        self.form.save()
        # create a few submissions
        for i in range(3):
            data = {'is_draft': False, 'answers': [{'question': str(self.q.id), 'answer_text': f'Val{i}'}]}
            resp = self.client.post(f'/api/forms/{self.form.slug}/submissions/', data=json.dumps(data), content_type='application/json')
            self.assertEqual(resp.status_code, 201)
        # report
        # authenticate as owner to access owner-only endpoints
        self.client.force_authenticate(user=self.user)
        resp = self.client.get(f'/api/forms/{self.form.slug}/submissions/report/')
        self.assertEqual(resp.status_code, 200)
        j = resp.json()
        self.assertEqual(j['count'], 3)
        # CSV export
        resp = self.client.get(f'/api/forms/{self.form.slug}/submissions/export/')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp['Content-Type'].startswith('text/csv'))
        # clear forced auth
        self.client.force_authenticate(user=None)

    def test_rate_limit_under_load(self):
        # simulate multiple rapid submissions (sequential) to ensure rate-limit enforces
        results = []
        for _ in range(5):
            data = {'is_draft': False, 'answers': [{'question': str(self.q.id), 'answer_text': 'X'}]}
            r = self.client.post(f'/api/forms/{self.form.slug}/submissions/', data=json.dumps(data), content_type='application/json')
            results.append(r.status_code)
        # at most rate_limit_count (2) successes
        successes = sum(1 for s in results if s == 201)
        self.assertLessEqual(successes, 2)
