"""Project package initialization.

Import the Celery app if Celery is installed. Make this tolerant so the
Django process can run even when development environment doesn't have Celery
installed (tests, local dev without broker, etc.).
"""
try:
	from .celery import app as celery_app
except Exception:  # pragma: no cover - optional dependency
	celery_app = None

__all__ = ('celery_app',)
