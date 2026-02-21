# M1-A Validation Log

Tracks acceptance evidence for issue #2.

## Acceptance Criteria Checklist (Issue #2)

- [x] **CI runs on PRs** — `.github/workflows/ci.yml` triggers on `pull_request` and runs `npm run check`.
- [~] **Required checks are enforced** — external repository setting; branch protection on `main` must require `CI / checks`.
- [~] **Local setup docs validated by a second developer** — primary author validated; second-developer confirmation pending.
- [x] **Baseline test command runs green in clean clone** — validated with `npm ci && cp .env.example .env.local && npm run check`.
- [x] **Technical conventions are documented in-repo** — `docs/conventions.md` committed.

Status legend: `[x] done`, `[~] external/pending gate`.

## CI Command Consistency

- Canonical script: `npm run check` (defined in `package.json`).
- `check` script expands to: lint + typecheck + tests.
- CI workflow uses the same command (`npm run check`) to avoid drift.

## External Pending Gates

1. **Second-developer local setup validation** (manual sign-off still required).
2. **Branch protection required-check enforcement** (maintainer/admin setting; ensure `CI / checks` remains required on `main`).