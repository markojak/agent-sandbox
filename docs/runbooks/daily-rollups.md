# Daily Rollups Backfill and Recompute Runbook

## Purpose
Operational steps to backfill and recompute `daily_rollups` safely for MVP insights metrics.

## Preconditions
- `daily_rollups` migration applied.
- Access to food entry source data and user profile goal/timezone fields.
- Rollup job endpoint available at `POST /api/rollups/recompute`.

## Backfill Procedure
1. Select user and date range (`startDate`, `endDate`) to materialize.
2. Read all food entries in that range.
3. Call `/api/rollups/recompute` with:
   - `userId`
   - `profile` (`dailyCalorieGoal`, `timeZone`)
   - `entries`
   - `startDate`, `endDate`
4. Persist returned rollups with upsert semantics on `(user_id, rollup_date)`.
5. Spot check a sample user-date against raw aggregate SQL.

## Late Entry / Historical Edit Recompute
1. Determine edited entry local date(s).
2. Call `/api/rollups/recompute` with `changedEntryDates` set to those dates.
3. Persist the returned rollups; no deletes required.
4. Verify insights output from `/api/insights` for the affected week.

## Validation Queries
Compare rollups to raw entries:

```sql
SELECT user_id, DATE(consumed_at) AS rollup_date, SUM(calories) AS total
FROM food_entries
GROUP BY user_id, DATE(consumed_at);
```

```sql
SELECT user_id, rollup_date, total_calories
FROM daily_rollups;
```

Expected: totals match for each `(user_id, rollup_date)` partition.
