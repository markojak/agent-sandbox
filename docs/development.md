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

Run all required checks before opening a PR:

```bash
npm run lint
npm run typecheck
npm test
```
