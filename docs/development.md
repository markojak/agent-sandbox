# Development

## Prerequisites

- Node.js 20+
- npm 10+

## Local bootstrap

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create local environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the app:

   - http://localhost:3000

## Quality checks

Run the baseline quality gate before opening a PR:

```bash
npm run check
```

This command runs:

- `npm run lint`
- `npm run typecheck`
- `npm test`

## Clean clone validation

From a fresh clone, the baseline readiness verification is:

```bash
npm ci
cp .env.example .env.local
npm run check
```

## Branch protection requirement

The `CI / checks` workflow must be configured as a required status check for `main` in GitHub branch protection settings.
