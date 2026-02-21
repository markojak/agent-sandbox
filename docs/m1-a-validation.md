# M1-A Validation Log

Tracks acceptance evidence for issue #2.

## Acceptance Criteria Checklist (Issue #2)

- [x] **CI runs on PRs** — `.github/workflows/ci.yml` triggers on `pull_request` and runs `npm run check`.
- [x] **Required checks are enforced** — verified via GitHub API branch protection on `main` requiring `checks` (strict mode).
- [~] **Local setup docs validated by a second developer** — still pending explicit second-developer sign-off.
- [x] **Baseline test command runs green in clean clone** — re-validated from a fresh clone using `npm ci && cp .env.example .env.local && npm run check`.
- [x] **Technical conventions are documented in-repo** — `docs/conventions.md` committed.

Status legend: `[x] done`, `[~] external/pending gate`.

## Evidence Snapshots

### Branch protection required check enforcement

- Verification command:

  ```bash
  gh api repos/markojak/agent-sandbox/branches/main/protection
  ```

- Relevant result fields:
  - `required_status_checks.strict: true`
  - `required_status_checks.contexts: ["checks"]`

### Fresh-clone validation

- Validation command sequence:

  ```bash
  git clone --depth 1 --branch shard/coding/frost-cliff https://github.com/markojak/agent-sandbox.git /tmp/agent-sandbox-m1a-validate
  cd /tmp/agent-sandbox-m1a-validate
  npm ci
  cp .env.example .env.local
  npm run check
  ```

- Result: pass (lint, typecheck, tests).

## CI Command Consistency

- Canonical script: `npm run check` (defined in `package.json`).
- `check` script expands to: lint + typecheck + tests.
- CI workflow uses the same command (`npm run check`) to avoid drift.

## External Pending Gates

1. **Second-developer local setup validation** (manual sign-off still required).