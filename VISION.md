# ShardCode Vision: Calorie Tracking Web App

## Product Purpose
Build a fast, low-friction web app that helps people consistently track calories, understand intake trends, and stay aligned with body-composition goals.

## Target Users
- People cutting, maintaining, or lean bulking who need daily calorie awareness.
- Busy users who want quick logging with minimal typing.
- Users who care about weekly trend signals more than perfect precision.

## Product Principles
- Fast capture beats perfect capture.
- Mobile-first workflow with desktop parity.
- Clear trends and goal alignment over dashboard clutter.
- Privacy-conscious defaults with explicit sharing controls.

## MVP Outcomes
- Users can log meals in under 20 seconds.
- Users can see daily totals and 7/30 day trends.
- Users can set a calorie goal and know daily progress.
- Users can edit or remove entries without friction.

## MVP Scope

### 1. Authentication and Accounts
- Email/password and OAuth sign-in.
- Basic profile with timezone, units, and goal calorie target.

### 2. Food Logging
- Add entries by free text (e.g., "2 eggs + toast") or manual fields.
- Store meal name, calories, quantity, meal time, notes.
- Edit/delete previous entries.

### 3. Daily and Historical Views
- Daily timeline of entries.
- Daily total calories and remaining-to-goal indicator.
- Weekly and monthly trend charts.

### 4. Search and Reuse
- Recent foods and favorite foods.
- Duplicate prior meal entries.

### 5. Basic Insights
- Goal adherence score by week.
- Average calories per day over rolling windows.
- Streak indicator (days with at least one logged meal).

## Out of Scope (MVP)
- Barcode scanning.
- Photo-based food recognition.
- Full macro/micro nutrient modeling.
- Social feed and public profiles.
- Wearable integrations.

## Architecture Direction
- Next.js App Router web app.
- Postgres database with Prisma ORM.
- Background jobs for aggregate trend materialization.
- API route layer with clear service boundaries.
- Observability: request logs, app errors, basic product analytics events.

## Data Model (Initial)
- `users`
- `profiles`
- `food_entries`
- `favorite_foods`
- `daily_rollups`

## Quality and Operational Requirements
- P95 logging action response under 500ms.
- Strong validation for numeric calorie fields.
- Idempotent entry creation endpoints where applicable.
- Unit + integration tests for core logging and rollup logic.

## Security and Privacy
- Encrypt sensitive auth-related values.
- No public data exposure by default.
- Clear account deletion flow.

## First Milestone Backlog Themes
1. Auth and profile foundation.
2. Food entry CRUD.
3. Daily totals and trend charts.
4. Favorites/recents and duplicate flow.
5. Rollup jobs and analytics instrumentation.
6. Test suite and deployment hardening.

## Success Metrics (Early)
- D7 retention of users who log at least once on day 0.
- Average logs per active user per day.
- Percent of active users with >=5 logged days per week.
- Goal adherence delta week-over-week.
