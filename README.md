# Platform CICD POC

Interactive dashboard demonstrating CI/CD deployment patterns (blue-green, canary, feature flags, A/B testing) with a Django REST API backend and React + TypeScript frontend.

## Overview

Full-stack proof-of-concept showcasing four key deployment strategies:

- **Blue-Green Deployment** — atomic version switches with instant rollback
- **Canary Deployment** — gradual rollout with traffic-based progression and error-rate monitoring
- **Feature Flags** — instant feature toggling without redeployment (with gradual rollout)
- **A/B Testing** — variant comparison with real-time conversion metrics

### Stack

- **Backend**: Django 4.2 + DRF 3.15 (transaction monitoring API)
- **Frontend**: React 18 + TypeScript + Vite (interactive dashboard)
- **Database**: PostgreSQL 16
- **Observability**: OpenTelemetry SDK + OTLP exporter
- **Testing**: Playwright E2E tests for deployment scenarios
- **Container**: Docker multi-stage build (Node + Python)

## Quick Start

### Prerequisites

- Docker & Docker Compose (recommended)
- OR: Python 3.12+, Node 20+

### With Docker Compose (Easiest)

```bash
docker-compose up -d

# Wait for services to start
sleep 10

# Initialize database
docker-compose exec api python manage.py migrate
docker-compose exec api python manage.py loaddata transactions/fixtures/transactions.json

# Open dashboard
open http://localhost:3000
```

API available at http://localhost:8000/api

### Local Development (Without Docker)

**Backend:**

```bash
cd app

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements-dev.txt

# Run migrations
python manage.py migrate

# Start dev server
python manage.py runserver
```

**Frontend:**

```bash
cd frontend

# Install dependencies
npm install

# Start dev server with API proxy
npm run dev
```

Frontend at http://localhost:3000, API at http://localhost:8000

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

### Health & Config
- `GET /health/` - Health check probe
- `GET /api/config/` - Current deployment config, active flags, A/B tests
- `GET /api/metrics/` - System metrics (deployment counts, error rates, etc.)

### Transactions
- `GET /api/transactions/` - List all transactions (filterable by risk_level, flagged, currency)
- `POST /api/transactions/flag/` - Flag a transaction as suspicious

### Deployments
- `GET /api/deployments/` - List all deployments
- `POST /api/deployments/` - Create new deployment (blue-green, canary, feature-flag, ab-test)
- `GET /api/deployments/{id}/` - Get deployment details
- `POST /api/deployments/{id}/rollback/` - Rollback deployment
- `POST /api/deployments/{id}/abort/` - Abort deployment

### Feature Flags
- `GET /api/flags/` - List all feature flags
- `POST /api/flags/` - Create feature flag
- `GET /api/flags/{id}/` - Get flag details
- `POST /api/flags/{id}/enable/` - Enable flag
- `POST /api/flags/{id}/disable/` - Disable flag
- `PATCH /api/flags/{id}/set_rollout/` - Set rollout percentage (0-100)

### A/B Tests
- `GET /api/ab-tests/` - List all A/B tests
- `POST /api/ab-tests/` - Create A/B test
- `GET /api/ab-tests/{id}/` - Get test details
- `GET /api/ab-tests/{id}/stats/` - Get test conversion metrics

## Deployment Patterns Guide

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for interactive testing of:

- **Blue-Green Deployment** — atomic version switches with instant rollback
- **Canary Deployment** — gradual rollout with traffic percentage and error-rate monitoring
- **Feature Flags** — instant rollout control without redeployment
- **A/B Testing** — variant comparison with conversion metrics

Each pattern can be tested via the interactive dashboard with real-time status updates.

## Architecture

### Backend
- **Framework**: Django 4.2 + Django REST Framework 3.15
- **Database**: PostgreSQL (psycopg2)
- **Observability**: OpenTelemetry SDK + OTLP exporter
- **Server**: Gunicorn with 2 workers
- **Container**: Python 3.12 slim, non-root user

### Frontend
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **State**: React Query for server state
- **Routing**: React Router v6
- **Testing**: Playwright E2E tests
- **Styling**: Custom CSS (responsive design)

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

## Testing

### Backend Tests
```bash
cd app
pytest tests/ -v --cov=config
```

### Frontend Tests
```bash
cd frontend
npm test                # Unit tests (Vitest)
npm run e2e             # E2E tests (Playwright)
```

## Next Steps

1. **Observability**: Wire OpenTelemetry to SigNoz/Datadog for real metrics
2. **Kubernetes**: Deploy using Helm chart in `chart/` with Argo Rollouts
3. **CI/CD Integration**: Connect GitHub Actions to trigger deployments via API
4. **Safety Gates**: Add pre-rollout tests and policy validation (OPA/Kyverno)
5. **Audit & Compliance**: Log all deployment decisions for compliance

## License

Internal POC
