# TASK-03 — Build notification panel and item actions

## Objective
Render the supplied light/dark notification panel states with accessible per-item actions, server pagination, and bilingual copy.

## Context
Read `../notifications-spec.md` and this task first. The five images show empty and populated light/dark states; their order text is illustrative. Use only backend-confirmed item fields from TASK-01.

## Existing code to reuse
TASK-02 state owner; `packages/ui/src/lib/pagination/pagination.ts`, `packages/ui/src/lib/spinner/spinner.ts`, `packages/ui/src/lib/alert/alert.ts`; `apps/roseApp/src/app/shared/business/confirmation-dialog.service.ts`; existing Lucide icons; `apps/roseApp/src/styles/_semantic.scss`; `apps/roseApp/public/i18n/en.json` and `ar.json`; `packages/shared/i18n/src/lib/language.service.ts`.

## Files to inspect
All reuse files above, `packages/ui/src/lib/account-menu/account-menu.ts` and `.html`, `apps/roseApp/src/app/core/components/navbar/navbar.html`, `apps/roseApp/src/app/shared/utils/testing/translate.testing.ts`, installed PrimeNG Menu/Popover or CDK Overlay public API, `.agents/rules/angular-ui.md`, `.agents/rules/angular-html-template.md`.

## Files allowed to modify
New panel component/template/spec under `apps/roseApp/src/app/features/notifications/`; `apps/roseApp/public/i18n/en.json` and `ar.json`. Add an item child only if the panel becomes materially complex; justify it. No navbar edits in this task. No new SCSS unless verified limitation is documented.

## Implementation requirements
Render title, unread count where relevant, clear-all and mark-all actions, initial loading, error/retry, empty state, rows and pagination using backend metadata. Disable invalid/repeated actions. Open only one item menu; position it outside clipped scroll, close on outside/Escape/success, return focus, and disable mark-read for read rows. Use actual ID. Match reference spacing, separators, truncated copy, read/unread background, empty icon, dark/light colors. Handle responsive viewport and RTL/LTR. Add all new UI strings in both JSON files and use existing `| translate` pipe (there is no registered `translatePipe` alias). Do not expose push/admin actions.

## Technical constraints
Angular standalone/OnPush conventions; PrimeNG/CDK supported overlay and Tailwind utilities with semantic tokens. No duplicate paginator/menu infrastructure, no ordinary component SCSS, no hardcoded English strings, no invented backend fields. Keep panel presentation separate from API calls.

## Dependencies
TASK-02 complete.

## Verification
Focused component tests for loading/error/empty/list, disabled controls, menu exclusivity/outside/Escape/focus, pagination, translation and direction. Run `npm exec nx run roseApp:test`, `npm exec nx run roseApp:typecheck`, `npm exec nx run roseApp:lint`, `git diff --check`. Manual visual comparison is part of TASK-05.

## Completion report
List files changed, UI states covered, exact commands/results, accessibility/RTL checks, and blockers.
