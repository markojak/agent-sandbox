# Reuse API

## GET `/api/recents`

Returns the latest unique non-draft meals for the authenticated user, sorted by most recent first.

### Query params

- `limit` (optional, default `5`)
  - Parsed as a number.
  - If `limit` is not a valid number (for example `limit=abc`), the route falls back to `5`.
- `offset` (not supported)
  - Any `offset` value (including invalid or negative values) is ignored.
  - The response falls back to default behavior (same result as omitting `offset`).

### Examples

```http
GET /api/recents?limit=abc
```

Uses fallback `limit=5`.

```http
GET /api/recents?offset=-10
```

`offset` is ignored; response is the same as `GET /api/recents`.
