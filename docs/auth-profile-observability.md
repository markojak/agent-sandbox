# Auth/Profile Observability Queries

This document defines the minimum log/event queries for M1 auth/profile release readiness.

## Event names

- `signup_started`
- `signup_completed`
- `signup_failed`
- `login_success`
- `login_failure`
- `login_failed`
- `profile_updated`
- `profile_update_failed`

## Log payload contract

Every event is emitted as structured JSON with:

- `domain: "auth-profile"`
- `event`
- `timestamp`
- contextual fields (`userId`, `email`, `reason`)
- on errors: `errorName`, `errorMessage`

## Dashboard/queries

### 1) Signup success rate

```sql
SELECT
  count(*) FILTER (WHERE event = 'signup_completed')::float /
  NULLIF(count(*) FILTER (WHERE event IN ('signup_completed', 'signup_failed')), 0) AS signup_success_rate
FROM logs
WHERE domain = 'auth-profile'
  AND timestamp >= NOW() - INTERVAL '24 hours';
```

### 2) Login failure reasons

```sql
SELECT reason, count(*) AS failures
FROM logs
WHERE domain = 'auth-profile'
  AND event = 'login_failure'
  AND timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY reason
ORDER BY failures DESC;
```

### 3) Profile update error volume

```sql
SELECT date_trunc('hour', timestamp) AS hour_bucket, count(*) AS errors
FROM logs
WHERE domain = 'auth-profile'
  AND event = 'profile_update_failed'
  AND timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY hour_bucket
ORDER BY hour_bucket;
```

### 4) p95 profile write latency

Computed by CI via `npm run test:perf` and enforced with `P95_THRESHOLD_MS=700`.
