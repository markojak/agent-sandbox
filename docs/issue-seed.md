# MVP Issue Seed (from `VISION.md`)

This document captures the first actionable GitHub issue set for MVP delivery, based directly on the backlog themes and scope in `VISION.md`.

## Created Issues

1. [#3 MVP: Auth + profile foundation](https://github.com/markojak/agent-sandbox/issues/3)
   - **Rationale:** Establishes identity, protected access, and user-specific settings (timezone, units, calorie goals) required for all downstream tracking and progress features.

2. [#4 MVP: Food entry CRUD (quick add + manual entry)](https://github.com/markojak/agent-sandbox/issues/4)
   - **Rationale:** Implements the core logging loop (create/edit/delete/read) and idempotent submission behavior needed to achieve sub-20-second meal capture.

3. [#5 MVP: Daily totals and 7/30-day trend views](https://github.com/markojak/agent-sandbox/issues/5)
   - **Rationale:** Delivers immediate daily progress feedback and trend visibility aligned with the product principle of clear signals over dashboard clutter.

4. [#6 MVP: Favorites, recents, and duplicate-entry flow](https://github.com/markojak/agent-sandbox/issues/6)
   - **Rationale:** Reduces input friction for repeated meals, improving speed and consistency of user logging behavior.

5. [#7 MVP: Daily rollups and basic insights metrics](https://github.com/markojak/agent-sandbox/issues/7)
   - **Rationale:** Adds background materialization for adherence, rolling averages, and streaks so insights remain correct and performant at scale.

6. [#8 MVP: Observability baseline for logs, errors, and analytics](https://github.com/markojak/agent-sandbox/issues/8)
   - **Rationale:** Enables operational visibility into latency, failures, and core product events required for reliability and iteration.

7. [#10 MVP: Core test coverage + CI quality gates](https://github.com/markojak/agent-sandbox/issues/10)
   - **Rationale:** Protects critical behavior (logging and rollups) with automated safeguards that prevent regressions during rapid MVP development.

8. [#11 MVP: Deployment hardening and production readiness](https://github.com/markojak/agent-sandbox/issues/11)
   - **Rationale:** Adds environment safety, migration discipline, health checks, and baseline security controls for stable release operations.

## Coverage Check vs Request

- ✅ Auth/profile
- ✅ Food entry CRUD
- ✅ Daily totals/trends
- ✅ Favorites/recents
- ✅ Rollups
- ✅ Observability
- ✅ Test coverage
- ✅ Deployment hardening

All seeded issues include: **Problem**, **Scope**, **Acceptance Criteria**, and **Validation Notes**.