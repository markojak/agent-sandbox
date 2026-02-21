# M1 Auth/Profile Release Checklist

Status: **Signed off**
Date: 2026-02-21
Owner: Reliability & Release

- [x] Lint, typecheck, unit, integration, e2e smoke, and perf-p95 CI checks implemented
- [x] Integration tests run against disposable Postgres service in CI
- [x] Migration forward/backward verification included in CI (`migration-verification` job)
- [x] Auth/profile observability events and error logging implemented
- [x] Dashboard/log queries documented (`docs/auth-profile-observability.md`)
- [x] p95 baseline enforced in CI (`P95_THRESHOLD_MS=700`)
- [x] Required status checks listed for branch protection

## Required branch protection checks (main)

- `lint`
- `typecheck`
- `unit`
- `integration-postgres`
- `migration-verification`
- `e2e-smoke`
- `perf-p95`
