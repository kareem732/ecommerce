# TASK-04 — Connect bell, badge, and panel in navbar

## Objective
Wire the existing authenticated bell to the panel and server unread count with minimal header edits.

## Context
Read `../notifications-spec.md` and this task first. Current bell in `navbar.html` already has responsive placement and a badge. `notificationCount = input(0)` has no caller binding, while `onNotificationClick()` closes menus and navigates home. Replace only this placeholder behavior.

## Existing code to reuse
`apps/roseApp/src/app/core/components/navbar/navbar.ts` and `.html`; TASK-02 state owner; TASK-03 panel; `packages/auth-service/src/lib/services/session.service.ts`; existing `onDocumentClick`, `onEscape`, `closeAllMenus` methods.

## Files to inspect
The files above, `apps/roseApp/src/app/core/components/navbar/navbar.spec.ts`, `apps/roseApp/src/app/features/shop/shop.ts` and `.html`, `apps/roseApp/src/app/remote-entry/entry.ts`.

## Files allowed to modify
`apps/roseApp/src/app/core/components/navbar/navbar.ts`, `navbar.html`, `navbar.spec.ts`. `apps/roseApp/src/app/features/shop/shop.ts`/`.html` only if necessary for binding; explain why. Do not edit account/search/mobile menus except the minimum coordination needed to close them when the notification panel opens.

## Implementation requirements
Inject/use the single state owner. Badge reflects `/unread-count`, including zero/unknown states; do not use current page length. Replace home navigation with panel toggle. Add `aria-expanded`, `aria-controls`, and correct bell/panel semantics. Load list only when panel opens; count may load at authenticated session start. Coordinate outside click and Escape so panel closes without breaking existing menu/search behavior. Reset on logout/account change through state owner. Keep bell visible at desktop/mobile as before. Document the exact header diff in completion report.

## Technical constraints
Do not redesign header, rename unrelated properties, change unrelated routes, or duplicate notification state. Follow Angular Signals/OnPush, existing `| translate`, theme/RTL, Tailwind/PrimeNG styles. Avoid extra subscriptions and duplicate requests.

## Dependencies
TASK-03 complete.

## Verification
Navbar tests for bell toggle, badge from unread endpoint/store, logged-out hidden state, outside click/Escape, and unchanged account/search controls. Run `npm exec nx run roseApp:test`, `npm exec nx run roseApp:typecheck`, `npm exec nx run roseApp:lint`, `git diff --check`.

## Completion report
List files changed, each header modification and reason, preserved behaviors, exact commands/results, and blockers.
