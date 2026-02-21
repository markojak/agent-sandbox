# Product Overview

## Goals

ShardCode’s core goal is to help users consistently track calorie intake and stay aligned with body-composition targets through a fast, low-friction experience.

### Primary outcomes
- Log meals in under 20 seconds
- View daily totals with progress-to-goal clarity
- Understand 7/30 day calorie trends
- Edit/remove entries without friction

### Target users
- People cutting, maintaining, or lean bulking
- Busy users who need minimal typing workflows
- Users who optimize based on weekly trends rather than perfect precision

## Architecture Direction

The product architecture is oriented around fast interaction paths, reliable aggregates, and maintainable service boundaries.

### Application stack
- **Frontend:** Next.js (App Router), mobile-first UI with desktop parity
- **Backend/API:** Next.js route layer with clear service boundaries
- **Database:** Postgres with Prisma ORM
- **Background processing:** Rollup jobs for trend materialization

### Initial data model
- `users`
- `profiles`
- `food_entries`
- `favorite_foods`
- `daily_rollups`

### Operational quality requirements
- P95 logging response under 500ms
- Strong validation for numeric calorie fields
- Idempotent entry creation where applicable
- Unit + integration tests for core logging and rollup logic

### Security and privacy
- Encrypt sensitive auth-related values
- No public data exposure by default
- Clear account deletion flow

## Success Metrics

### Early product metrics
- D7 retention of users who log at least once on day 0
- Average logs per active user per day
- Percent of active users with >=5 logged days per week
- Goal adherence delta week-over-week

### Milestone themes tied to delivery
1. Auth and profile foundation
2. Food entry CRUD
3. Daily totals and trend charts
4. Favorites/recents and duplicate flow
5. Rollup jobs and analytics instrumentation
6. Test suite and deployment hardening

---
Source of truth: [`VISION.md`](../VISION.md)
