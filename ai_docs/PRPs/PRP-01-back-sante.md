# Back santé et métriques PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable DevOps and CI to verify that the backend is available and exposes health/metrics endpoints so that monitoring and smoke tests can run reliably.

## Why

**Business Justification:**
- Ops/DevOps need to confirm the back responds before deploying or running E2E tests
- Prometheus metrics enable observability (latency, errors, throughput)
- Smoke tests in CI block broken deployments

**Priority:** High (B01 P0), Medium (B02 P2)

## What

### Feature Description
- **B01** : GET on baseUrl returns 2xx or HTML (no 5xx, no timeout). Usable as smoke test in CI.
- **B02** : GET `/api/metrics` returns 200 and Prometheus-format text (presence of `# HELP` or `# TYPE`). May be protected by secret/header.

### Scope
**In Scope:**
- Root endpoint availability
- `/api/metrics` endpoint with Prometheus format
- Optional auth for metrics (env var)

**Out of Scope:**
- Custom health check payload
- Detailed application health (DB, external services)

### User Stories
1. As a CI pipeline, I want the back to respond on baseUrl so that E2E tests can run
2. As an ops engineer, I want `/api/metrics` to expose Prometheus metrics so that I can monitor the app

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/architecture.md` | Ports, URLs, routes overview |
| `back/src/app/api/metrics/route.ts` | Existing metrics implementation |
| `back/src/app/api/route.ts` | Root API handler if exists |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `back/src/app/api/metrics/route.ts` | MODIFY | Ensure Prometheus format, optional auth |
| `back/src/app/page.ts` or root handler | MODIFY | Ensure 2xx/HTML on baseUrl |

### Existing Patterns to Follow

```typescript
// Metrics route pattern
// GET /api/metrics returns Prometheus text format
```

### Dependencies
- `prom-client` or equivalent for Prometheus metrics
- No new external deps if already in place

## Implementation Details

### API Endpoints

#### `GET /` (baseUrl)
**Purpose:** Root availability check

**Response:** 2xx status, HTML or minimal JSON

**Auth:** None

#### `GET /api/metrics`
**Purpose:** Prometheus metrics scrape endpoint

**Response:** `text/plain` with `# HELP`, `# TYPE`, metric lines

**Auth:** Optional (header or query param from env)

## Validation Criteria

### Functional Requirements
- [x] GET baseUrl returns 2xx or HTML
- [x] GET `/api/metrics` returns 200
- [x] Response body contains `# HELP` or `# TYPE`
- [x] Cypress smoke test passes (`cy.request` or `cy.visit`)

### Technical Requirements
- [x] TypeScript compiles (`pnpm build`)
- [x] ESLint passes (`pnpm lint`)
- [x] No timeout on health checks under normal load

### Testing Steps
1. `curl http://localhost:4500/` → 2xx
2. `curl http://localhost:4500/api/metrics` → 200, Prometheus text
3. Run Cypress smoke spec
