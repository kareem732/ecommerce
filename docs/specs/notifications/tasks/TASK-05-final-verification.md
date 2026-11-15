# TASK-05 — Integration review and final verification

## Objective
Validate the completed notification flow, fix only demonstrated defects, and report the exact result.

## Context
Read `../notifications-spec.md` and this task first. TASK-01 through TASK-04 must be complete. This task verifies the implementation; it does not authorize new feature scope.

## Existing code to reuse
The new feature tests; `apps/roseApp/src/app/core/components/navbar/navbar.spec.ts`; existing Vitest setup; Nx `roseApp` targets; both translation JSON files; `apps/roseApp/src/app/features/shop/shop.html` for integration context.

## Files to inspect
All files changed by TASK-01 through TASK-04, `apps/roseApp/project.json`, `eslint.config.mjs`, `apps/roseApp/src/app/app.config.ts`, `apps/roseApp/src/app/remote-entry/entry.routes.ts`, and relevant focused test files.

## Files allowed to modify
Only feature files, navbar files, and translation files changed by prior tasks when a specific defect is confirmed; related tests may be added/updated. No unrelated application files, dependency/config changes, or Web Push work.

## Implementation requirements
Review exact endpoint methods/URLs/body/query, count source, pagination metadata and last-page deletion, stale requests, duplicate mutation protection, failure preservation, logout reset, loading vs empty, menu focus/escape/outside, RTL/LTR, light/dark, and mobile layout. Compare to images without hardcoding sample notification content. Inspect final diff for unnecessary architecture, duplicate UI, SCSS, unrelated header edits, and secrets. Correct only confirmed defects and rerun affected checks.

## Technical constraints
Use existing Nx targets and repository style. Do not weaken or skip tests to pass. Do not invent missing backend semantics. If browser/manual verification is unavailable, report it as not run.

## Dependencies
TASK-01, TASK-02, TASK-03, TASK-04 complete.

## Verification
Run `npm exec nx run roseApp:test`, `npm exec nx run roseApp:lint`, `npm exec nx run roseApp:typecheck`, `npm exec nx run roseApp:build`, `git diff --check`, and inspect `git diff --stat`/`git diff`. Manually exercise authenticated/unauthenticated, empty/list/error, item/all actions, keyboard, Arabic/English, light/dark, and mobile where an app/backend environment is available.

## Completion report
List files changed, defects fixed, exact check commands with passed/failed/not-run statuses, manual scenarios, unresolved backend risks, and any scope deviation.
