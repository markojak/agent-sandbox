# Deployment Runbook (MVP Hardening)

## Environment contract

Required variables (validated at boot and via `npm run env:check`):

- `APP_ENV` (`development|test|staging|production`)
- `AUTH_SECRET` (min 32 chars)
- `DATABASE_URL` (valid URL)
- `LOG_INGEST_TOKEN` (min 16 chars)

If missing/invalid, server boot fails with an actionable error list.

## Pipeline flow

1. **CI (`ci.yml`)** runs on push/PR:
   - `npm run lint`
   - `npm run test`
   - `npm run build`
   - `npm run migrate:check -- --dry-run`
   - `npm audit --audit-level=high`
2. **Staging preview (`deploy.yml` / `staging-preview`)** runs on PR after CI:
   - env validation
   - migration dry-run
   - build artifact check
3. **Production promotion (`deploy.yml` / `production`)** is manual (`workflow_dispatch`) and gated by successful preflight:
   - env validation
   - migration deployment step
   - production deploy command placeholder

## Migration safety process

### Pre-deploy checks

```bash
npm run env:check
npm run migrate:check -- --dry-run
```

### Production migration

```bash
npm run migrate:deploy
```

### Rollback guidance

1. Revert application deployment to previous release.
2. If backward-incompatible migration was applied, execute a pre-authored rollback SQL script for the affected migration (store alongside each migration as `*_rollback.sql`).
3. Re-run health checks:

```bash
curl -f https://<env>/api/health
```

4. Confirm auth/logging smoke path before re-enabling traffic.

## Health checks and monitoring

- Endpoint: `GET /api/health`
- Returns `200` + `status=ok` when app/dependency checks are ready.
- Returns `503` + `status=degraded` with misconfiguration details when not ready.

Recommended uptime monitor: poll `/api/health` every 60s with 2-failure alert threshold.

## Post-deploy smoke checklist

1. `GET /api/health` returns `200`.
2. Auth route responds and rate-limits after threshold:
   - `POST /api/auth/login`
3. Logging ingest route rejects invalid token and accepts valid token:
   - `POST /api/logs/ingest`
4. Review deployment logs for migration output and absence of env validation errors.
