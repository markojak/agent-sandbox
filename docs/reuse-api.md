# Reuse & Telemetry API Reference

This page captures the `/api/entries`, `/api/favorites`, `/api/recents`, and `/api/telemetry` endpoints that power the reuse/favorites demo along with the telemetry events that these routes emit. It is also a quick runbook for reproducing the reuse/telemetry surface and validating it locally.

## Running the reuse demo
- Install dependencies with `npm install`.
- Run the dev server (`npm run dev`) and visit the reuse demo at [http://localhost:3000/reuse](http://localhost:3000/reuse).
- All reuse-related endpoints live under `/api` and expect the same authentication header described below.

## Authentication contract
Every reuse endpoint requires the `x-user-id` header (Next.js API routes do not perform any other authentication for the PoC). A missing header always yields a `401` response:

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{ "error": "Missing x-user-id header for authenticated request" }
```

When present, the header can be any non-empty user identifier delivered from the demo page (the `/reuse` UI sends `x-user-id: test-user`).

## API routes
All routes return JSON responses with `200` for successful `GET` requests and `201` when a `POST` creates a resource. Validation issues result in `400`, and missing data returns `404`.

### Entries collection (`/api/entries`)
- **GET** `/api/entries`
  - Headers: `x-user-id`
  - Response: `{ entries: Entry[] }` sorted newest-first for the requesting user.
- **POST** `/api/entries`
  - Headers: `x-user-id`
  - Body: `{ mealName: string, calories: number, quantity: string, mealTime: string, notes?: string, source?: "favorite" | "recent" }`
  - Behavior:
    - Validates `mealName`, `calories`, `quantity`, and `mealTime` via `parseEntryInput`.
    - `source` is optional—when set to `"favorite"` or `"recent"`, matching telemetry events are emitted.
  - Success: `201` with `{ entry: Entry }`
  - Failure: `400` when validation fails.

### Entry duplication (`/api/entries/[entryId]/duplicate`)
- **POST** `/api/entries/{entryId}/duplicate`
  - Headers: `x-user-id`
  - Path parameter: `entryId` of an existing entry for the user.
  - Body: `{ mode?: "draft" | "immediate" }` (default is `"draft"`).
  - Behavior: Clones the entry while generating new `id`/`updatedAt`, marks it as draft unless `immediate` is provided, and emits an `entry_duplicated` telemetry event.
  - Success: `201` with `{ entry: Entry }`
  - Not found: `404` when the entry does not exist for the user.

### Favorites (`/api/favorites`)
- **GET** `/api/favorites`
  - Headers: `x-user-id`
  - Returns the user’s saved favorite meals sorted newest-first.
- **POST** `/api/favorites`
  - Headers: `x-user-id`
  - Body: `{ entryId: string }`
  - Adds a favorite from the specified entry (deduplicates based on meal name) and emits `favorite_added`.
  - Success: `201` with `{ favorite: FavoriteFood }`
  - Failure: `404` when the source entry cannot be found.
- **DELETE** `/api/favorites/{favoriteId}`
  - Headers: `x-user-id`
  - Removes the favorite and emits `favorite_removed`.
  - Success: `200` with `{}`
  - Failure: `404` when the favorite is missing.

### Recents (`/api/recents`)
- **GET** `/api/recents`
  - Headers: `x-user-id`
  - Query parameters: `limit` (optional, defaults to `5`)
  - Returns `limit` unique recent entries by meal name (never drafts) sorted newest-first.
  - Success: `200` with `{ recents: Entry[] }`

### Telemetry (`/api/telemetry`)
- **GET** `/api/telemetry`
  - Headers: `x-user-id`
  - Response: `{ events: TelemetryEvent[] }` sorted newest-first for the user.
  - Useful for manual QA to assert that actions trigger the right events.

## Telemetry event types
Each action in the reuse flow emits one of the following events stored via `state.telemetry` in `lib/reuse-store.ts`:

| Event type | Description |
|------------|-------------|
| `favorite_added` | Emitted when `POST /api/favorites` successfully persists a favorite. |
| `favorite_removed` | Emitted when `DELETE /api/favorites/{favoriteId}` succeeds. |
| `added_from_favorite` | Emitted when `POST /api/entries` submits a new entry with `source: "favorite"`. |
| `added_from_recent` | Emitted when `POST /api/entries` submits a new entry with `source: "recent"`. |
| `entry_duplicated` | Emitted when `POST /api/entries/{entryId}/duplicate` succeeds (draft or immediate). |

Each telemetry event captures `userId`, a generated `id`, optional `entryId`/`favoriteId`, and an ISO `timestamp`.

## Validation & testing runbook
- Run `npm run lint` to ensure code style rules still pass after touching reuse-related logic.
- Run `npm run test:unit` to validate the reuse API tests (they exercise the same API routes/telemetry events described above).
- Optionally run `npm run test:integration` when extending the runtime behavior.
- After tests finish, rerun `npm run dev` to interact with the `/reuse` demo and inspect telemetry via the `/api/telemetry` endpoint.
