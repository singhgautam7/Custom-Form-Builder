# Backend (Django)

This folder contains the Django backend for the Custom Form Builder project.

## Example `.env`

Copy `.env.example` or create a `.env` file in this directory and fill in the secrets. Example variables:

```
DEBUG=True
SECRET_KEY=replace-this-with-a-secure-secret
DATABASE_URL=sqlite:///db.sqlite3
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_HOST_USER=you@example.com
EMAIL_HOST_PASSWORD=supersecret
DEFAULT_FROM_EMAIL=no-reply@example.com
SIMPLE_JWT_ACCESS_TOKEN_LIFETIME=3600
SIMPLE_JWT_REFRESH_TOKEN_LIFETIME=1209600
```

## Install dependencies

From the `backend` folder run:

```bash
python3 -m pip install -r requirements.txt
```

(You may want to use a virtual environment.)

## Run migrations

```bash
python3 manage.py migrate
```

## Create superuser

```bash
python3 manage.py createsuperuser
```

## Run dev server

```bash
python3 manage.py runserver
```

## API docs

The backend exposes the following useful endpoints (when the server is running locally at http://localhost:8000):

- Admin panel: http://localhost:8000/admin/  (create a superuser with `python manage.py createsuperuser`)
- OpenAPI schema: http://localhost:8000/api/schema/
- Swagger UI: http://localhost:8000/api/docs/
- Redoc UI: http://localhost:8000/api/redoc/

Note: API routes for Forms, Questions and Submissions are mounted under `/api/` (see `apps/forms/urls.py`).

## Notes
- Do not commit `.env` with real secrets. Keep it in `.gitignore`.
- `frontend/node_modules` is ignored in the root `.gitignore` to avoid adding large files to the repository.

## Features supported by this backend

- User authentication (register, login, refresh tokens, email verification, logout).
- Form builder data model: Forms, Questions (various question types: text, textarea, number, date, dropdown, radio, checkbox, multiselect), Options JSON for choice questions.
- Submissions: draft (partial save) and finalize flows, per-submission answers.
- Rate limiting per-form and per-IP with a persisted counter and owner/admin endpoints to reset or inspect limits.
- Notifications: email notifications on new submissions (configurable per-form).
- Reporting: paginated submissions report and CSV streaming export (owner-only).
- Analytics: lightweight per-form analytics endpoint (counts, per-question stats, average completion time).
- Admin APIs: notification logs and ratelimit management endpoints.

## Background tasks and async processing

The backend uses background processing for slow I/O (email sending):

- Preferred: Celery tasks (configured via `CELERY_BROKER_URL` and `CELERY_RESULT_BACKEND` in `.env`, default `redis://localhost:6379/0`).
- Development fallback: if Celery is not installed or a broker is not available, the code will fall back to an in-process ThreadPoolExecutor so local development and tests run without a broker.

To run a local worker with Redis (recommended for development), you can use Docker Compose. Example (not included here): bring up Redis, then run:

```bash
# install extras
pip install -r requirements.txt
# start Redis (e.g., docker run -p 6379:6379 redis)
# run Django dev server
python manage.py runserver
# in another terminal run a Celery worker
celery -A form_maker worker --loglevel=info
```

If you want, I can add a `docker-compose.yml` that starts Redis and a Celery worker for local development.
