from django.test import TestCase
from rest_framework.test import APIClient
from apps.forms.models import Form, Question
from django.contrib.auth import get_user_model
import json

User = get_user_model()


class QuestionApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='owner', email='owner@example.com', password='pw')
        self.form = Form.objects.create(title='QForm', description='D', created_by=self.user, slug='q-form')
        self.client.force_authenticate(user=self.user)

    def test_create_dropdown_question_and_validate(self):
    # APIClient is force-authenticated in setUp
        payload = {'question_text': 'Pick', 'question_type': 'dropdown', 'is_required': True, 'order': 1, 'options': ['a','b','c']}
        resp = self.client.post(f'/api/forms/{self.form.slug}/questions/', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        qid = resp.json()['id']
        # validate a correct answer
        vresp = self.client.post(f'/api/forms/{self.form.slug}/questions/{qid}/validate/', data=json.dumps({'answer_text': 'b'}), content_type='application/json')
        self.assertEqual(vresp.status_code, 200)
        # validate an invalid answer
        vresp2 = self.client.post(f'/api/forms/{self.form.slug}/questions/{qid}/validate/', data=json.dumps({'answer_text': 'z'}), content_type='application/json')
        self.assertEqual(vresp2.status_code, 400)

    def test_number_and_date_and_multiselect(self):
        # number with min/max
        payload = {'question_text': 'Age', 'question_type': 'number', 'is_required': True, 'order': 2, 'min_value': 18, 'max_value': 99}
        resp = self.client.post(f'/api/forms/{self.form.slug}/questions/', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        qid = resp.json()['id']
        # valid number
        vresp = self.client.post(f'/api/forms/{self.form.slug}/questions/{qid}/validate/', data=json.dumps({'answer_number': 30}), content_type='application/json')
        self.assertEqual(vresp.status_code, 200)
        # invalid number
        vresp2 = self.client.post(f'/api/forms/{self.form.slug}/questions/{qid}/validate/', data=json.dumps({'answer_number': 10}), content_type='application/json')
        self.assertEqual(vresp2.status_code, 400)

        # date with min_date
        payload = {'question_text': 'Future date', 'question_type': 'date', 'is_required': False, 'order': 3, 'options': {'allow_past': False}}
        resp = self.client.post(f'/api/forms/{self.form.slug}/questions/', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        qid = resp.json()['id']
        vresp = self.client.post(f'/api/forms/{self.form.slug}/questions/{qid}/validate/', data=json.dumps({'answer_date': '2025-12-31'}), content_type='application/json')
        self.assertEqual(vresp.status_code, 200)

        # multiselect
        payload = {'question_text': 'Pick many', 'question_type': 'multiselect', 'is_required': False, 'order': 4, 'options': ['x','y','z']}
        resp = self.client.post(f'/api/forms/{self.form.slug}/questions/', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        qid = resp.json()['id']
        vresp = self.client.post(f'/api/forms/{self.form.slug}/questions/{qid}/validate/', data=json.dumps({'answer_choices': ['x','z']}), content_type='application/json')
        self.assertEqual(vresp.status_code, 200)

    def test_schema_endpoint(self):
        # create a couple of questions and fetch schema
        payload = {'question_text': 'Email me', 'question_type': 'email', 'is_required': True, 'order': 1}
        resp = self.client.post(f'/api/forms/{self.form.slug}/questions/', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        sresp = self.client.get(f'/api/forms/{self.form.slug}/client-schema/')
        self.assertEqual(sresp.status_code, 200)
        data = sresp.json()
        self.assertIn('questions', data)
