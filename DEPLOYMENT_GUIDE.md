# Deployment Strategies Showcase

This guide demonstrates four key deployment strategies using the Platform CICD POC dashboard.

## Overview

The Platform CICD POC API includes a React dashboard that allows you to interactively test and observe different deployment patterns:

1. **Blue-Green Deployment** — atomic version switches with instant rollback
2. **Canary Deployment** — gradual rollout with traffic-based progression
3. **Feature Flags** — instant rollout control without redeployment
4. **A/B Testing** — variant comparison with conversion metrics

All patterns can be toggled and monitored in real-time via the web dashboard.

---

## 1. Blue-Green Deployment

### What It Is

Two identical production environments (blue and green). Deploy new version to the inactive environment, run tests, then switch all traffic atomically.

**Pros:**
- Instant rollback (just switch back to blue)
- Zero downtime
- Full production validation before cutover

**Cons:**
- Requires 2x infrastructure
- Can't gradually validate load behavior

### How to Test

1. **Start services:**
   ```bash
   docker-compose up -d
   cd app && python manage.py migrate  # if needed
   ```

2. **Open dashboard:** http://localhost:3000

3. **Create blue-green deployment:**
   - Go to **Deployments** page
   - Click **+ New Deployment**
   - Version: `1.2.0`
   - Strategy: **Blue-Green**
   - Click **Create Deployment**

4. **Verify deployment:**
   - Deployment appears in table with status `pending`
   - Can rollback if needed
   - Status transitions to `succeeded`

5. **Rollback:**
   - Click **Rollback** on the succeeded deployment
   - Status changes to `rolled_back`
   - System reverts to previous version

### API Endpoints

```bash
# Create deployment
POST /api/deployments/
{
  "version": "1.2.0",
  "strategy": "blue_green",
  "status": "pending"
}

# Rollback
POST /api/deployments/{id}/rollback/

# Get deployments
GET /api/deployments/
```

---

## 2. Canary Deployment

### What It Is

Gradually roll out to a percentage of traffic. Monitor error rate and latency. Auto-rollback or proceed based on metrics.

**Pros:**
- Validate production behavior incrementally
- Catch issues at low traffic % before full rollout
- Gradual exposure limits blast radius

**Cons:**
- Complexity in traffic routing
- Longer deployment cycle
- Need good observability

### How to Test

1. **Create canary deployment:**
   - Go to **Deployments** page
   - Click **+ New Deployment**
   - Version: `1.3.0`
   - Strategy: **Canary**
   - Click **Create Deployment**

2. **Monitor canary progress:**
   - Deployment shows in table
   - In the **Latest Deployment** card, canary progress bar shows traffic %
   - Card displays error rate (initially 0%)
   - Progress stages: 5% → 10% → 25% → 50% → 100%

3. **Gradual rollout:**
   - System advances automatically through stages
   - Each stage validates error rate stays below threshold
   - Status stays `in_progress` during rollout
   - Changes to `succeeded` when complete

4. **Rollback on high error rate:**
   - If error_rate exceeds threshold during rollout
   - Deployment status changes to `failed`
   - Traffic instantly reverts to previous version

### Canary Stages

| Stage | Traffic | Next Condition |
|-------|---------|---|
| Initial | 5% | Error rate < 1% for 5 min |
| Phase 1 | 10% | Error rate < 1% for 5 min |
| Phase 2 | 25% | Error rate < 1% for 10 min |
| Phase 3 | 50% | Error rate < 1% for 10 min |
| Complete | 100% | Deployment succeeded |

### API Endpoints

```bash
# Create canary deployment
POST /api/deployments/
{
  "version": "1.3.0",
  "strategy": "canary",
  "canary_percentage": 0,
  "error_rate": 0.0
}

# Get canary progress
GET /api/deployments/{id}/

# Abort canary
POST /api/deployments/{id}/abort/
```

---

## 3. Feature Flags

### What It Is

Deploy code with flags disabled. Enable gradually for % of users. Instant rollback = disable flag (no redeploy needed).

**Pros:**
- Instant rollback without redeployment
- Enable on-demand (decoupled from deployment)
- Gradual rollout with kill switch

**Cons:**
- Code complexity (flag checks everywhere)
- Stale flags accumulate technical debt
- Not a deployment strategy (code still deployed)

### How to Test

1. **Create feature flag:**
   - Go to **Feature Flags** page
   - Click **+ New Flag**
   - Flag Name: `new-transaction-view`
   - Description: `Improved transaction detail UI`
   - Status: **Enabled**
   - Click **Create Flag**

2. **Enable flag:**
   - Flag appears in the list
   - Click **Enable** to activate
   - Status changes to `enabled`

3. **Gradual rollout:**
   - Go to **Deployments** page
   - Create deployment with strategy **Feature Flag**
   - Dashboard shows active flag with status
   - In **Feature Flags** page, create another flag
   - Select **Rolling Out** status
   - Adjust rollout % slider to test incremental enablement

4. **Disable flag (rollback):**
   - Click **Disable** on active flag
   - Status changes to `disabled`
   - All users see old behavior instantly

### Feature Flag Lifecycle

```
DISABLED (code deployed, feature hidden)
   ↓
ROLLING_OUT (enable for X% of users gradually)
   ↓
ENABLED (100% of users see new behavior)
   ↓
DISABLED (instant rollback, no redeploy)
```

### API Endpoints

```bash
# Create flag
POST /api/flags/
{
  "name": "new-transaction-view",
  "description": "Improved transaction detail UI",
  "status": "disabled",
  "rollout_percentage": 0
}

# Enable flag
POST /api/flags/{id}/enable/

# Disable flag
POST /api/flags/{id}/disable/

# Set rollout percentage
PATCH /api/flags/{id}/set_rollout/
{
  "rollout_percentage": 25
}

# Get all flags
GET /api/flags/
```

---

## 4. A/B Testing

### What It Is

Split traffic between two variants. Measure conversion/performance metrics for each. Declare winner and roll out.

**Pros:**
- Quantified decision-making (data-driven)
- User experience testing without guessing
- Identify best approach before full rollout

**Cons:**
- Requires instrumentation for metrics
- Statistical significance takes time/traffic
- Parallel variant maintenance during test

### How to Test

1. **Create A/B test:**
   - Go to **A/B Tests** page
   - Click **+ New Test**
   - Test Name: `checkout-flow-variant`
   - Description: `Testing new checkout UI`
   - Variant A: `Original Flow` (default)
   - Variant B: `New Flow`
   - Split: 50% (50/50 split)
   - Click **Create Test**

2. **View test results:**
   - Test card shows both variants side-by-side
   - Displays for each variant:
     - Conversions (number)
     - Views (traffic)
     - Conversion rate (%)
   - Traffic split shown at bottom (50% / 50%)

3. **Adjust traffic split:**
   - After learning preferences, change split
   - 80/20 to favor winning variant
   - Later 100/0 to fully roll out winner

4. **Monitor metrics:**
   - Dashboard **A/B Tests** section shows active test count
   - Real-time conversion rate updates
   - Comparison makes winner obvious

### Example Scenario

| Stage | Traffic Split | Metric A | Metric B | Status |
|-------|---|---|---|---|
| 1 (test design) | 50/50 | — | — | Draft |
| 2 (gathering data) | 50/50 | 5% CR | 7% CR | Active |
| 3 (variant B winning) | 20/80 | — | — | Active |
| 4 (full rollout) | 0/100 | — | — | Completed |

### API Endpoints

```bash
# Create A/B test
POST /api/ab-tests/
{
  "name": "checkout-flow-variant",
  "description": "Testing new checkout UI",
  "variant_a_name": "Original Flow",
  "variant_b_name": "New Flow",
  "split_percentage": 50,
  "status": "draft"
}

# Get test stats
GET /api/ab-tests/{id}/stats/

# Get all tests
GET /api/ab-tests/
```

---

## System Metrics

The dashboard provides real-time metrics:

- **Total Deployments** — cumulative count
- **Successful Deployments** — completed without rollback
- **Failed Deployments** — hit error thresholds or were aborted
- **Rollback Count** — completed rollbacks
- **Flagged Transactions** — marked as suspicious
- **Total Transactions** — all recorded transactions
- **Active Feature Flags** — enabled or rolling out
- **Active A/B Tests** — currently in progress

View these on the **Dashboard** home page.

---

## Configuration View

The **Dashboard** shows current deployment state under the metrics grid:

```json
{
  "version": "1.2.0",
  "deployment_strategy": "blue_green",
  "deployment_status": "succeeded",
  "feature_flags": [
    {
      "name": "new-transaction-view",
      "status": "rolling_out",
      "rollout_percentage": 25
    }
  ],
  "active_ab_tests": [
    {
      "name": "checkout-flow-variant",
      "status": "active",
      "variant_a_conversion_rate": 5.2,
      "variant_b_conversion_rate": 7.1
    }
  ]
}
```

Fetch programmatically:

```bash
GET /api/config/
```

---

## E2E Testing

Run Playwright tests to verify all deployment patterns:

```bash
cd frontend
npm install
npm run e2e
```

Test scenarios:
- **deployment.spec.ts**: Create blue-green, canary, rollback
- **features.spec.ts**: Create flags, toggle status, adjust rollout
- **transactions.spec.ts**: Flag transactions, view deployment status

---

## Production Patterns

### Blue-Green in Kubernetes

Use Argo Rollouts with `BlueGreen` rollout strategy:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: api
spec:
  strategy:
    blueGreen:
      activeService: api-active
      previewService: api-preview
      autoPromotionSeconds: 300
```

### Canary with Kargo

Use Kargo to automate canary stages:

```yaml
apiVersion: kargo.akuity.io/v1alpha1
kind: Freight
metadata:
  name: v1.3.0
spec:
  images:
  - image: platform-cicd-poc-api:1.3.0
  - canaryPercentage: 5
  - progressDeadlineSeconds: 300
```

### Feature Flags with LaunchDarkly/Unleash

Integrate with external flag service for cross-service flags.

### A/B Testing with Data Analytics

Connect to Segment, Mixpanel, or custom event stream for production conversion tracking.

---

## Troubleshooting

### Deployment stuck in `in_progress`

- Check API logs: `docker logs platform-cicd-poc-api-api-1`
- Verify database: `docker exec platform-cicd-poc-api-db-1 psql -U poc -c "SELECT * FROM transactions_deploymentevent;"`
- Rollback or abort deployment manually

### Flag not showing in dashboard

- Ensure flag status is `enabled` or `rolling_out`
- Check network tab in browser DevTools for `/api/config/` call
- Refresh browser if stale cache

### A/B test metrics not updating

- Test must be in `active` status
- Check transaction data is flowing (`/api/metrics/` endpoint)
- Verify client code is incrementing conversion metrics

### Frontend not loading

- Check frontend container: `docker logs platform-cicd-poc-api-frontend-1`
- Ensure `npm install` ran: `docker-compose exec frontend npm list`
- Verify Vite dev server on port 3000: `curl http://localhost:3000`

---

## Next Steps

- **Integrate with real CI/CD**: Connect GitHub Actions to trigger deployments via API
- **Add observability**: Wire OpenTelemetry to SigNoz/Datadog for real metrics
- **Scale to Kubernetes**: Deploy using Helm charts (see `chart/` directory)
- **Implement safety gates**: Add pre-rollout tests, policy validation (OPA/Kyverno)
- **Audit & compliance**: Log all deployment decisions for compliance audits
