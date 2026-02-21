# ShardCode Calorie Tracker

A fast, low-friction calorie tracking web app focused on helping users stay aligned with body-composition goals through quick logging and clear trends.

## Product Vision

ShardCode is built for people cutting, maintaining, or lean bulking who need daily calorie awareness without heavy data entry. The product prioritizes:

- **Fast capture over perfect capture**
- **Mobile-first workflow with desktop parity**
- **Trend clarity and goal alignment over dashboard clutter**
- **Privacy-conscious defaults with explicit sharing controls**

## MVP Scope

The MVP is designed to deliver core daily tracking value quickly.

### 1) Authentication and Accounts
- Email/password and OAuth sign-in
- Basic profile: timezone, units, calorie goal target

### 2) Food Logging
- Add entries via free text (e.g., `2 eggs + toast`) or manual fields
- Track meal name, calories, quantity, meal time, notes
- Edit/delete previous entries

### 3) Daily and Historical Views
- Daily timeline of entries
- Daily total calories and remaining-to-goal indicator
- 7/30 day trend views (weekly and monthly)

### 4) Search and Reuse
- Recent foods and favorite foods
- Duplicate prior meal entries

### 5) Basic Insights
- Weekly goal adherence score
- Rolling average calories/day
- Streak indicator (days with at least one logged meal)

## MVP Out of Scope

- Barcode scanning
- Photo-based food recognition
- Full macro/micro nutrient modeling
- Social feed and public profiles
- Wearable integrations

## Milestone Themes

1. Auth and profile foundation
2. Food entry CRUD
3. Daily totals and trend charts
4. Favorites/recents and duplicate flow
5. Rollup jobs and analytics instrumentation
6. Test suite and deployment hardening

## Project Setup

### Prerequisites
- Node.js 20+
- npm 10+

### Run Locally

```bash
npm install
cp .env.example .env.local
npm run db:migrate:up
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality Gates (M1 auth/profile)

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test:integration
npm run db:verify-migrations
npm run test:e2e
npm run test:perf
```

## Documentation

- Product overview: [`docs/product-overview.md`](docs/product-overview.md)
- Observability queries: [`docs/auth-profile-observability.md`](docs/auth-profile-observability.md)
- M1 release checklist: [`docs/m1-release-checklist.md`](docs/m1-release-checklist.md)
- Vision source of truth: [`VISION.md`](VISION.md)
