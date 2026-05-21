# Platform CICD POC - Frontend

React + TypeScript dashboard for demonstrating CI/CD deployment patterns (blue-green, canary, feature flags, A/B testing).

## Setup

```bash
cd frontend
npm install
```

## Development

Start dev server with API proxy:

```bash
npm run dev
```

Opens at `http://localhost:3000` with proxy to `http://localhost:8000/api`

## Build

```bash
npm run build
```

Outputs to `../app/static/dist` for Django serving.

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests (Playwright)

Start backend and frontend, then run:

```bash
npm run e2e
```

Test scenarios:
- **deployment.spec.ts**: Create/rollback blue-green and canary deployments
- **features.spec.ts**: Create/toggle feature flags, create A/B tests with metrics
- **transactions.spec.ts**: View/flag transactions, dashboard features

## Architecture

- **src/services/api.ts**: HTTP client + types
- **src/hooks/**: React Query hooks for data fetching/mutations
- **src/pages/**: Dashboard, Deployments, FeatureFlags, ABTests
- **src/components/**: Reusable UI components
- **e2e/tests/**: Playwright E2E tests

## Environment

Create `.env` from `.env.example`:

```bash
VITE_API_URL=http://localhost:8000/api
```

## Key Features

- Real-time transaction monitoring with filtering
- Flag suspicious transactions with custom reasons
- Create and manage deployments (blue-green, canary, feature flag, A/B test)
- Toggle feature flags and adjust rollout percentages
- View A/B test results with conversion rates
- System metrics dashboard
