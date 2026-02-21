# Testing Guide

## Pyramid for MVP

- **Unit (`tests/unit`)**: deterministic pure logic tests for parsing/validation, totals, adherence, and streak calculations.
- **Integration (`tests/integration`)**: API route coverage for authenticated food entry CRUD and trend rollups.
- **Smoke E2E (`tests/e2e`)**: minimal happy-path verification of create-entry → trends flow.

## Fixtures

- Shared fixtures live in `tests/fixtures`.
- Current core fixture: `tests/fixtures/entries.ts` (fixed timestamps to avoid flaky date behavior).

## Local Commands

```bash
npm run test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:coverage
```

## Coverage / Quality Gates

- Coverage is enforced in `vitest.config.ts`.
- Critical modules (`lib/core`, `lib/server`, `app/api`) must stay at **>= 80%** for statements, branches, functions, and lines.
- CI fails on lint or test failures.

## Flake Tracking

- Current flaky tests tracked: **0**.
- Any flaky test should be tagged in PR notes and issue comments with reproduction notes and stabilization follow-up.
