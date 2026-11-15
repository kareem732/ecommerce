# TASK-01 — Confirm backend contract and implement API client

## Objective
Provide verified notification models and a typed HTTP client for the six end-user endpoints. Do not start if the item schema cannot be confirmed.

## Context
Read `../notifications-spec.md` and this task first. The supplied endpoint screenshot shows route names only; the list envelope and unread-count payload are confirmed in the user brief, but item and mutation response schemas are not.

## Existing code to reuse
`apps/roseApp/src/environments/environment.ts` for base URL; `apps/roseApp/src/app/app.config.ts` and `remote-entry/entry.routes.ts` for HTTP/interceptors; `apps/roseApp/src/app/features/shop/interfaces/home.model/home-model-response.ts` for envelope shape only where feature boundary permits; `apps/roseApp/src/app/features/shop/services/shop.service.ts` for HttpParams style; `apps/roseApp/src/app/core/interceptors/loading.interceptor.ts` for `skipLoading()`.

## Files to inspect
The reuse files above, `packages/auth-service/src/lib/interceptors/auth.interceptor.ts`, `packages/auth-service/src/lib/interceptors/error.interceptor.ts`, `apps/roseApp/src/app/features/shop/services/shop.service.spec.ts`, and authoritative backend API schema or backend source/fixture for notification item and mutation responses.

## Files allowed to modify
New files only under `apps/roseApp/src/app/features/notifications/` for `notifications.models.ts`, `notifications-api.service.ts`, and `notifications-api.service.spec.ts`. Add an endpoint constant in that feature if useful. Update the main specification only to record verified schema evidence. No `ShopService` or auth changes.

## Implementation requirements
1. Record source/location of actual item fields, ID type, and mutation response shapes. If absent, stop with a blocker and do not guess.
2. Implement GET list with integer page/limit, optional type/isRead/search; trim and limit search to 200; omit missing optional params. Validate/normalize `isRead` to allowed strings before requests.
3. Implement GET unread-count; PATCH mark-all-read; DELETE clear-all; PATCH `/{id}` with `{isRead:true}`; DELETE `/{id}`. Use actual ID type and URL encoding.
4. Use `environment.apiUrl` and current interceptors. Keep service stateless. Do not add admin or push methods.
5. Test exact methods, URLs, params, bodies, envelope handling, and no invented fields with `HttpTestingController`.

## Technical constraints
Angular 21, Nx `roseApp`, TypeScript 5.9, existing RxJS/HttpClient style. No new dependencies, state library, UI, translations, or SCSS. Respect `scope:rose-app` boundaries. Preserve existing global error handling; avoid duplicate local error toasts.

## Dependencies
None. This task blocks all later tasks until backend schema is verified.

## Verification
Run `npm exec nx run roseApp:test` (or the narrowest Nx-supported test selection after checking help), `npm exec nx run roseApp:typecheck`, `npm exec nx run roseApp:lint`, then `git diff --check`. Report any baseline failures separately.

## Completion report
List files changed, schema evidence, methods implemented, exact commands/results, and blockers or remaining unknowns.
