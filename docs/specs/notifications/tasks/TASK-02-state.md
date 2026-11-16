# TASK-02 — Own notification list and unread state

## Objective
Create one storefront state owner for the bell count and panel data, with safe refresh and mutation transitions.

## Context
Read `../notifications-spec.md` and this task first. Badge count must come from `unread-count`, not the current list page. Keep only the current server page in memory.

## Existing code to reuse
TASK-01 API client/models; `packages/auth-service/src/lib/services/session.service.ts` login/user signals; `apps/roseApp/src/app/features/shop/stores/wishlist/wishlist.store.ts` for signal store/request patterns; `apps/roseApp/src/app/features/auth/utils/with-request-state.ts` if appropriate; toast `NotificationService` for feedback only.

## Files to inspect
All reuse files above, `apps/roseApp/src/app/features/shop/stores/wishlist/wishlist.store.spec.ts`, `apps/roseApp/src/app/core/interceptors/loading.interceptor.ts`, `packages/auth-service/src/lib/interceptors/error.interceptor.ts`.

## Files allowed to modify
New `apps/roseApp/src/app/features/notifications/notifications.store.ts` (or a single similarly named state service) and its focused spec. TASK-01 files only if a proved API contract correction is required; document such edits.

## Implementation requirements
Expose current page, metadata, unread count, initial/loading/refresh/error status, and pending mutations. Load count once on authenticated session activation; load page 1 on first panel open and requested pages on navigation. Deduplicate requests and ignore stale results. Retain valid rows during refresh errors. Prevent repeated mutations. After successful single/all read or delete/clear, refresh authoritative list/count; only close the item menu through UI success handling. For deletion of last item on a nonfirst page, navigate to previous page using metadata. Reset rows/count/pending state on logout or user change and prevent late responses from repopulating another user's state. Do not use list data to calculate global count.

## Technical constraints
Angular Signals and existing `@ngrx/signals` conventions; use RxJS lifecycle management if subscribing. Avoid a second cache or duplicate state in panel/navbar. No new dependencies, styling, translations, or unrelated auth edits. Surface failures distinctly from empty state.

## Dependencies
TASK-01 complete with verified item schema.

## Verification
Test login/count, open/list, stale responses, failure preservation, duplicate suppression, read/delete/all mutations, pagination boundary, logout/account switch. Run `npm exec nx run roseApp:test`, `npm exec nx run roseApp:typecheck`, `npm exec nx run roseApp:lint`, `git diff --check`.

## Completion report
List files changed, state transitions implemented, exact commands/results, and remaining blockers.
