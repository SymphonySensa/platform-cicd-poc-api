# Platform POC API

Transaction Monitoring stub API for demonstrating ArgoCD/Kargo/Kyverno/SLSA on AKS.

## Overview

Django REST API that provides transaction monitoring endpoints with OpenTelemetry instrumentation for observability. Designed as a proof-of-concept for CI/CD and deployment pipeline validation.

## Quick Start

### Prerequisites

- Python 3.12+
- pip/venv

### Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r app/requirements-dev.txt

# Run migrations
cd app && python manage.py migrate

# Start dev server
python manage.py runserver
```

### Testing

```bash
cd app
pytest tests/ -v --cov=config
```

### Linting & Formatting

```bash
cd app
ruff check . --fix
ruff format .
```

## Docker

```bash
# Build image
docker build -t platform-cicd-poc-api:latest .

# Run container
docker run -p 8000:8000 platform-cicd-poc-api:latest
```

## Health Check

```bash
curl http://localhost:8000/health/
```

## API Endpoints

- `/health/` - Health check probe
- `/api/` - API root (add your endpoints here)

## Architecture

- **Framework**: Django 4.2 + Django REST Framework 3.15
- **Database**: PostgreSQL (psycopg2)
- **Observability**: OpenTelemetry SDK + OTLP exporter
- **Server**: Gunicorn with 2 workers
- **Container**: Python 3.12 slim, non-root user

## Configuration

Environment variables (optional):

- `DJANGO_SETTINGS_MODULE` - Settings module (default: `config.settings`)
- `DEBUG` - Debug mode (default: `False`)
- `DATABASE_URL` - Database connection string

## CI/CD

- **PR Checks**: Lint (ruff), tests (pytest), security (Semgrep), dependencies (Socket.dev)
- **Build**: Multi-stage Docker build with cache mounts
- **Push**: Pushes to ECR on main branch

See `.github/workflows/` for details.

## Pre-commit Hooks

Hooks are configured in `.pre-commit-config.yaml`:

```bash
pip install pre-commit
pre-commit install
```

Runs on commit:
- Trailing whitespace cleanup
- YAML validation
- Secret detection
- Code formatting (ruff)
- Docker linting (hadolint)

## Next Steps

1. Add transaction endpoints to `/api/`
2. Configure PostgreSQL connection
3. Add OpenTelemetry exporter endpoint (Jaeger/Datadog)
4. Deploy to AKS using Helm chart in `chart/`

## License

Internal POC
