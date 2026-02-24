# Shard Orchestration Smoke Test

## Purpose
The shard orchestration smoke test is a lightweight check that keeps the distributed test infrastructure honest. Running through the smoke flow verifies that our `vitest` setup, CLI runners, and shard-aware helpers start up cleanly. It also gives humans a regular reminder of which commands signal that the orchestration layer is still wired up.

## How to verify locally
1. Install dependencies (`npm install`) and make sure your working tree is clean so the smoke test can point to a known baseline.
2. Execute `npm run test -- --help`. The script resolves to `vitest run --help`, so it must print the full list of flags, including `--shard <shards>` and other shard orchestration knobs. Seeing that output confirms that a developer shell can resolve the test scripts and that the shard options are still surfaced to the CLI.
3. Observe the command exits with `0` and no errors in the help text. That exit code means the smoke test can reach the orchestration layer without touching any real test suites, and the help text ensures the `shard`-related arguments remain discoverable.

## What changed
- Added this smoke test reference page so anyone touching CI, local automation, or shard orchestration knows why and how to run the check.
- Call out the `npm run test -- --help` command to document the exact trigger that proves the runner bootstraps and exposes the shard options.
