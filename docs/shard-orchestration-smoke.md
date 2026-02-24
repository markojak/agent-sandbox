# Shard Orchestration Smoke Test

## Purpose
Issue #54 asked for a quick smoke reference that keeps the shard-aware Vitest CLI in the open. This page explains why we run the light check and where to look when the orchestration layer needs reassurance.

## How to verify locally
1. Ensure dependencies are installed (`npm install`) and your working tree is clean so the smoke entry point has a known baseline.
2. Run `npm run test -- --help`. The script resolves to `vitest run --help`, so its output should start with the familiar `vitest/4.0.18` banner and enumerate options such as `--shard <shards>`, `--run`, and `--watch`. Seeing `--shard <shards>` in that list proves the shard hooks are exposed to CLI consumers without actually executing suites.
3. Confirm the command exits with `0` and prints no errors. A clean help output means the CLI layer boots and lists the shard controls while leaving the real suites untouched.

## What changed
- Added this issue #54–driven reference page so the smoke test has a discoverable home.
- Linked the new guide from the README documentation list so the smoke path is easy to find.
- Documented that the verification step is `npm run test -- --help`, and that it surfaces the `vitest run` help text with the shard options we care about.
