---
trigger: model_decision
description: Apply when adding tests, debugging a failure, changing shared behavior, or verifying Angular/Nx code changes.
---

# Testing and Verification

## Discover before running
- Inspect the affected project's `project.json`, test config, scripts, and nearby tests. Do not assume all projects use the same runner or targets.
- Current inspected setup: applications (`shell`, `adminDashboard`, `roseApp`) use Vitest via Nx; `auth-service`, `ui`, and `theme` use Jest via Nx; `shared-i18n` and `shared` use Vitest. Verify the current config before relying on this snapshot.
- Use npm and the installed local Nx version. Discover the actual target name and command rather than guessing.

## Test quality
- Add or update focused tests for changed observable behavior, edge cases, validation, API states, and regression risks.
- Follow neighboring test setup, mocks, fixtures, and assertion styles.
- Prefer behavior assertions over implementation-detail assertions.
- Never delete, skip, weaken, or rewrite a test merely to make a run pass.

## Verification approach
- Run the narrowest relevant tests first, then affected project lint/type-check/build targets when available and proportionate.
- If shared-library public APIs, project tags, or boundary configuration changed, run relevant lint checks for the library and consumers when practical.
- Review `git diff --check` and `git diff` where available; confirm no unrelated files changed.
- Do not run every workspace target by default for a small isolated change if a focused check provides appropriate coverage.
- If a check fails, determine whether it is caused by the change. Report uncertainty when you cannot establish the baseline.
- Report exact commands and statuses: passed, failed, skipped, or not run. Never imply checks passed when they were not executed.
