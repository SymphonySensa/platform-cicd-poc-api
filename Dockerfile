# syntax=docker/dockerfile:1.7

# ── frontend builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# ── python dependencies ──────────────────────────────────────────────────────
FROM python:3.12-slim AS py-builder

WORKDIR /build

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip

COPY app/requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --prefix=/install -r requirements.txt

# ── runtime ──────────────────────────────────────────────────────────────────
FROM python:3.12-slim AS runtime

ARG APP_VERSION=dev
ENV APP_VERSION=${APP_VERSION} \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.settings

RUN addgroup --system app && adduser --system --ingroup app app

WORKDIR /app

COPY --from=py-builder /install /usr/local
COPY app/ .

# Copy frontend build output to Django static directory
RUN mkdir -p static/dist
COPY --from=frontend-builder /frontend/dist static/dist/

USER app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health/')"

CMD ["gunicorn", "config.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "2", \
     "--timeout", "30", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
