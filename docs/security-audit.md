# Dependency Security Audit Baseline

Last run: 2026-02-21

Command:

```bash
npm audit --audit-level=high
```

## Findings

- 14 high severity vulnerabilities detected.
- Current chain originates from ESLint/transitive `minimatch` versions (`GHSA-3ppc-4f35-3m26`).
- `npm audit fix --force` suggests upgrading to ESLint 10 (breaking).

## Remediation plan

1. Track upstream release compatibility for `eslint-config-next` with ESLint 10.
2. Upgrade lint stack once compatible and rerun audit.
3. Keep CI audit enabled (non-blocking) so new vulnerabilities are visible.
