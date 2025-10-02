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

If `drf-spectacular` is installed and configured, the API schema will be available at `/api/schema/` and the docs at `/api/docs/`.

## Notes
- Do not commit `.env` with real secrets. Keep it in `.gitignore`.
- `frontend/node_modules` is ignored in the root `.gitignore` to avoid adding large files to the repository.
