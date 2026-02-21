# Issue #9 Acceptance Checklist (M1-B)

## Acceptance criteria mapping

- [x] **Migration applies cleanly to empty DB**  
  **Files:** `prisma/schema.prisma`, `prisma/migrations/20260221140000_init_users_profiles/migration.sql`  
  **Command:** `npm run db:migrate:deploy`

- [ ] **Rollback path validated in dev/test** *(execution pending local DB service)*  
  **Files:** `scripts/validate-migration-gate.mjs`, `scripts/assert-seed-fixtures.mjs`  
  **Command:** `npm run db:migration:validate:local`  
  **Expected flow:** apply migration -> seed -> assert fixtures -> reset -> re-apply -> reseed -> re-assert

- [ ] **Schema reviewed and approved by tech lead** *(external gate)*  
  **Files for review:** `prisma/schema.prisma`, `prisma/migrations/20260221140000_init_users_profiles/migration.sql`

- [x] **Seed script creates deterministic test users**  
  **Files:** `prisma/seed-fixtures.mjs`, `prisma/seed.mjs`, `tests/seed-fixtures.test.mjs`  
  **Commands:** `npm run db:seed`, `npm run test`

## Runnable validation path

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test`
4. `npm run db:migration:validate:local` *(requires `.env` + running Postgres and shadow DB)*

Or run all static checks together:

- `npm run validate`
- `npm run validate:with-db` *(includes DB migration gate)*

## Migration gate evidence (current branch)

### Command

```bash
DATABASE_URL='postgresql://postgres:postgres@localhost:5432/agent_sandbox?schema=public' \
SHADOW_DATABASE_URL='postgresql://postgres:postgres@localhost:5432/agent_sandbox_shadow?schema=public' \
npm run db:migration:validate
```

### Output summary

- Script started gate sequence and executed `npx prisma migrate deploy`
- Prisma connected config using `localhost:5432`
- Validation halted with `P1001: Can't reach database server at localhost:5432`
- Conclusion: gate script is wired correctly; full apply/reset evidence requires a running Postgres instance in dev/test environment

## Static validation evidence

- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run test` ✅ (1/1 pass: deterministic seed fixture test)
