# Issue #9 Acceptance Checklist (M1-B)

## Acceptance criteria mapping

- [x] **Migration applies cleanly to empty DB**  
  **Files:** `prisma/schema.prisma`, `prisma/migrations/20260221140000_init_users_profiles/migration.sql`  
  **Command:** `npm run db:migrate:deploy`

- [x] **Rollback path validated in dev/test**  
  **Files:** `scripts/validate-migration-gate.mjs`, `scripts/assert-seed-fixtures.mjs`  
  **Command:** `DATABASE_URL='postgresql://chiron@localhost:5432/agent_sandbox?schema=public' npm run db:migration:validate`  
  **Validated flow:** apply migration -> seed -> assert fixtures -> reset -> re-apply -> reseed -> re-assert

- [ ] **Schema reviewed and approved by tech lead** *(external gate)*  
  **Files for review:** `prisma/schema.prisma`, `prisma/migrations/20260221140000_init_users_profiles/migration.sql`

- [x] **Seed script creates deterministic test users**  
  **Files:** `prisma/seed-fixtures.mjs`, `prisma/seed.mjs`, `tests/seed-fixtures.test.mjs`  
  **Commands:** `npm run db:seed`, `npm run test`

## Runnable validation path

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test`
4. `npm run db:migration:validate:local` *(requires `.env` + running Postgres)*

Or run all static checks together:

- `npm run validate`
- `npm run validate:with-db` *(includes DB migration gate)*

## Migration gate evidence (current branch)

### Command

```bash
DATABASE_URL='postgresql://chiron@localhost:5432/agent_sandbox?schema=public' \
npm run db:migration:validate
```

### Output summary

- `prisma migrate deploy` applied `20260221140000_init_users_profiles` on empty DB
- `prisma db seed` inserted deterministic fixtures
- `node scripts/assert-seed-fixtures.mjs` passed
- `prisma migrate reset --force --skip-seed` completed successfully
- Re-deploy + re-seed + fixture assertions passed
- Final gate output: `Migration gate validation passed (apply -> reset -> reapply + deterministic seed).`

## Static validation evidence

- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run test` ✅ (1/1 pass: deterministic seed fixture test)
- `DATABASE_URL='postgresql://chiron@localhost:5432/agent_sandbox?schema=public' npm run db:migration:validate` ✅

## Revalidation after SHARD_REVIEW: CHANGES_REQUESTED

Re-ran on current branch after feedback:

- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run test` ✅
- `DATABASE_URL='postgresql://chiron@localhost:5432/agent_sandbox?schema=public' npm run db:migration:validate` ✅

Notable gate output checkpoints:
- seed executed twice successfully (`Seeded 2 deterministic users and profiles.`)
- fixture assertions passed twice (`Seed fixtures are deterministic and valid.`)
- reset + reapply path passed (`Migration gate validation passed ...`)
