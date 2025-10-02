from django.test import TestCase, Client
from django.urls import reverse
from django.utils import timezone
from apps.forms.models import Form, Question
from django.contrib.auth import get_user_model
import json

User = get_user_model()


class SubmissionFlowTests(TestCase):
    def setUp(self):
        self.client = Client()
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
