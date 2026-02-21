# Conventions

## Route and service boundaries

Use this rule of thumb: routes orchestrate, services implement business logic.

### Routes (`app/**`)

Routes should:

- Handle request/response concerns only (params, headers, cookies, status codes)
- Validate and normalize incoming input
- Call one or more service functions
- Map service results to UI or API responses

Routes should not:

- Contain data access logic
- Contain third-party API integration details
- Implement cross-route business rules

### Services (`lib/services/**`)

Services should:

- Encapsulate business rules and workflows
- Perform data access via repositories/clients
- Call external systems
- Return structured results and domain-level errors

Services should not:

- Depend on Next.js route objects (`NextRequest`, `NextResponse`) unless in adapter layers
- Render UI concerns

## Dependency direction

Keep dependencies one-way:

- `app/**` → `lib/services/**` → `lib/data/**` (or clients)
- Never import route-layer modules inside services

## Testing guidance

- Unit test services in isolation
- Keep route tests focused on request/response mapping and status behavior
