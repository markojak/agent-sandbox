# Observability Runbook (MVP Baseline)

## What is instrumented

### Structured API request logs
Core MVP API routes are wrapped with `withObservedRoute(...)` and emit an `api_request` JSON log with:
- `requestId` (correlation id)
- `userIdHash` (salted SHA-256 hash from `x-user-id` header)
- `method`
- `route`
- `status`
- `latencyMs`
- `env` + `release`

Current core coverage:
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `PATCH /api/profile`
- `POST /api/logs`

### Error tracking
Unhandled route exceptions are captured through `captureError(...)` with:
- error `name`, `message`, `stack`
- `requestId`, `route`, `method`, `userIdHash`
- release/environment tags

Optional centralized ingest can be configured via:
- `ERROR_TRACKING_INGEST_URL`

### Product analytics events
Core events are emitted through `trackAnalyticsEvent(...)`:
- `sign_up`
- `log_entry_create`
- `log_entry_edit`
- `log_entry_delete`
- `reuse_flow`

Events are deduplicated by `dedupeKey` (from request body or `x-idempotency-key`) to prevent duplicate emission per action key.

## PII-safe logging rules

1. Never log raw note content, passwords, tokens, auth headers, cookies, or secrets.
2. Any payload keys matching: `password|secret|token|apiKey|authorization|cookie|session|note|notes` are redacted as `[REDACTED]`.
3. Use `userIdHash` instead of raw user ids/emails in logs.
4. Do not include free-form request bodies in request logs.

## Dashboard / Query starter templates

Use your log backend to build these two minimum charts:

### 1) p95 logging latency for `/api/logs`
```
filter event = "api_request"
  and route = "/api/logs"
| stats p95(latencyMs) by bin(5m)
```

### 2) Error trend for `/api/logs`
```
filter event = "api_request"
  and route = "/api/logs"
| stats count_if(status >= 500) as errors, count(*) as total by bin(5m)
| eval error_rate = errors / total
```

## Local sanity checklist

- [ ] `npm run test` passes.
- [ ] `npm run lint` passes.
- [ ] `POST /api/logs` emits `api_request` and `analytics_event`.
- [ ] `POST /api/logs` with `{ "simulateFault": true }` emits `unhandled_exception` and 500 response.
- [ ] Inspect logs and confirm `note` or `password` fields are redacted.
