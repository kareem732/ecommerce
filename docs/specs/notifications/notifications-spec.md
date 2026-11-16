# Rose notifications: implementation specification

Status: planning only. Source of truth: repository code plus the supplied endpoint contract and five reference images. No application code is changed by this specification.

## 1. Goal and scope

Give authenticated storefront users a bell panel with a server-backed unread badge, paginated notification list, individual mark-read/delete actions, and mark-all/clear-all actions. Match the supplied light and dark references: maroon/pink heading, action strip, separated rows, highlighted unread rows, clipped text, and centered empty state. Support Arabic RTL, English LTR, desktop, and mobile.

In scope: initial/loading/empty/list/error states, retry, single open item menu, pagination, badge synchronization, translation, keyboard access, tests. Search and type/read filters are API capabilities but have no control in the supplied UI; keep the service query-capable and defer their UI. No admin creation, test push, permission prompt, or Web Push subscription UI in this delivery.

## 2. Existing architecture and reuse

`roseApp` is the Nx storefront remote (`apps/roseApp`), hosted through Module Federation by `shell`. `Shop` owns `<app-navbar />` and `<app-toast-host />` in `apps/roseApp/src/app/features/shop/shop.html`. The bell lives in `apps/roseApp/src/app/core/components/navbar/navbar.html`; it renders only when logged in. Its `notificationCount` input defaults to zero and is not bound by `Shop`. `onNotificationClick()` currently navigates to `/shop/home`. The navbar already closes account/mobile/search menus on document click and Escape. The bell is visible in the common action row at mobile and desktop widths.

Use `HttpClient` with the configured `environment.apiUrl`, auth interceptor, error interceptor, and `skipLoading()` for panel requests so the global loading overlay does not obscure local loading feedback. Use `skipErrorNotification()` only when the panel shows its own equivalent error; avoid duplicate toasts. Existing `NotificationService` in `@org/auth-service` is a **toast** service, not a notification API client. `ToastHost` already renders those toasts. `SessionService` exposes login/user signals. The feature's signals should follow local signal patterns; add an NgRx signal store only if its shared state needs justify it, without duplicating state in the panel. The unread badge and panel need one state owner scoped to the storefront session. On logout or account change, clear rows and unread count immediately, then reload for the next user.

Reuse `@org/ui` `Pagination` for server metadata or the existing `SharedPagination` if its current page/page-size interface fits better; do not write a third paginator. The action menu needs an anchored overlay; inspect PrimeNG Menu/Popover and Angular CDK Overlay APIs available in installed packages before selecting one. The shared `AccountMenu` is a generic standalone menu with built-in trigger and hardcoded defaults; it is not a drop-in per-row menu, though its click-outside/Escape pattern is useful. Reuse `Spinner`, existing Lucide icons, theme tokens, and `ConfirmationDialogService` if product confirmation is wanted for clear-all. Full inventory: [reuse-inventory.md](./reuse-inventory.md).

The application uses `TranslatePipe` from `@ngx-translate/core`, with templates using `| translate`. The requested `translatePipe` spelling is not a registered pipe in this codebase; the equivalent established form is `{{ 'NOTIFICATIONS.TITLE' | translate }}`. Add new English/Arabic keys only to `apps/roseApp/public/i18n/en.json` and `ar.json`. `LanguageService` controls direction in `RemoteEntry`, and `ThemeService` plus existing semantic tokens control light/dark appearance.

## 3. Component and service design

| Unit | Responsibility and interface | Dependencies and reason |
| --- | --- | --- |
| `NotificationsApiService` (new, storefront feature) | Typed `list(query)`, `unreadCount()`, `markRead(id)`, `delete(id)`, `markAllRead()`, `clearAll()` methods. No UI state. | `HttpClient`, API URL, existing response/pagination types. Separate backend calls from presentation. |
| `NotificationsStore` (new, one storefront-scoped owner) | Expose list, metadata, unread count, request status/error, mutation pending state and methods to load/refresh/page/mutate/reset. | API service and `SessionService`. Shared because navbar badge and panel need the same data. |
| `NotificationsPanel` (new) | Render heading, actions, loading/error/empty/list/pagination. Input/open contract determined by navbar; emits close only if needed. | Store, translation, paginator, Lucide, overlay/menu. A panel is absent today. |
| Per-item markup in panel (default) | Render title/message/read state and a three-dot menu keyed by notification ID. | Keep in panel unless complexity actually justifies a child component. Avoid extra component by default. |
| `Navbar` (existing) | Bell trigger, panel mount, badge binding. | Small integration only; no unrelated menu rewrite. |

Use existing generic `ApiResponse<T>` / `PaginatedPayload<T>` from `apps/roseApp/src/app/features/shop/interfaces/home.model/home-model-response.ts` only if feature-boundary ownership is acceptable; otherwise define small feature-local envelope types without importing private shop internals. Do not create a new shared library. The exact notification item type and mutation response types are blocked until backend schema evidence is captured. Do not cast unknown fields to invented types.

No persistent cache. Retain last successfully loaded page while refreshing; show a local busy indicator. Load unread count when a signed-in session becomes active and after successful mutations; load list when panel opens and on page change. Avoid fetching the list merely to populate the badge. Concurrent refreshes must be deduplicated or stale responses ignored. Do not subtract the current page's unread rows from the global badge. Prefer authoritative count refetch after mutations; for clear-all, zero may be set after confirmed success, with count refetch if needed. Error leaves prior valid rows/count intact and exposes retry; a first-load failure never renders empty state.

## 4. Backend contract mapping

Base URL: `${environment.apiUrl}/api/notifications`. Authenticated requests use the existing interceptor. `GET /api/notifications` takes required integer `page` and `limit`; optional string `type` ('ORDER' | 'PROMOTION' | 'SYSTEM' | 'REVIEW' | 'OTHER'), `isRead` (`true`, `false`, `1`, `0`), and trimmed `search` of max 200 characters. Omit absent optional params. List response is `ApiResponse<{data: NotificationItem[]; metadata: {page:number; limit:number; total:number; totalPages:number}}>`. `NotificationItem` properties verified from live OpenAPI 3.0 spec: `id` (UUID), `userId` (UUID), `type` (ORDER | PROMOTION | SYSTEM | REVIEW | OTHER), `title` (string), `message` (string), `isRead` (boolean), `link` (string | null), `createdAt` (ISO date-time), `updatedAt` (ISO date-time). The header badge uses `GET /api/notifications/unread-count` with `payload.unreadCount: number`.

| UI action | Method and endpoint | Body / response evidence |
| --- | --- | --- |
| Open panel, retry, change page | `GET /api/notifications` | Query above; list envelope, metadata and `Notification` item schema confirmed via backend OpenAPI. |
| Initialize/refresh badge | `GET /api/notifications/unread-count` | `payload.unreadCount: number` confirmed via backend OpenAPI. |
| Mark one unread row | `PATCH /api/notifications/{id}` | `{ "isRead": true }`; 200 Success envelope confirmed via backend OpenAPI. |
| Delete one row | `DELETE /api/notifications/{id}` | UUID ID; 200 Success envelope confirmed via backend OpenAPI. |
| Mark all read | `PATCH /api/notifications/mark-all-read` | 200 Success envelope confirmed via backend OpenAPI. |
| Clear all | `DELETE /api/notifications/clear-all` | 200 Success envelope confirmed via backend OpenAPI. |

Administrative `POST /api/notifications` has no existing Rose admin workflow. Push endpoints (`push-status`, `test-push`, `vapid-public-key`, `subscriptions`) are out of the panel scope. Their response/request schemas remain unknown and must not be inferred.

## 5. State transitions and edge cases

| Event | Required transition |
| --- | --- |
| Authenticated session starts | Clear previous user data, fetch unread count once. Keep bell available while count loads. |
| Panel opens | Close other navbar menus; show panel; load page 1 if not already loaded for this user. Show loading before empty. |
| List succeeds | Replace current page and metadata atomically; show empty only for `total === 0` (or a genuinely empty first page). |
| List fails | Set error, preserve prior rows; show retry. Never turn failure into empty. |
| Item menu opens | Track only one ID; new trigger closes prior menu. Outside click/Escape closes it and returns focus to its trigger. |
| Mark read | Ignore already read/pending row. Send PATCH with actual ID. After success, refresh count and current page; close menu. On failure, retain row and count. |
| Delete | Send DELETE with actual ID once. After success, refresh count and current page. If the current page becomes empty and page > 1, request preceding page using backend metadata. |
| Mark all read / clear all | Disable repeated action while pending; update list and badge only on success, then refresh authoritative state. Empty result disables both actions. |
| Page change | Request server page with fixed page size (proposed 20 to match example); use returned metadata. Ignore stale responses. |
| Logout/account switch | Clear list/count/menu state immediately; cancel or ignore old in-flight results. |

Do not assume `metadata.totalPages === 0` for an empty collection: supplied example returns 1. If search/filter UI is added later, reset to page 1 and preserve query on pagination.

## 6. UI, accessibility, and localization

Use a panel anchored to the bell with a viewport-safe max width and height; on small screens it should fit within viewport gutters. Keep the item menu outside any clipped scrolling area using supported overlay positioning. Prefer `@org/ui` pagination/PrimeNG for interaction, Tailwind utilities for layout, semantic tokens for colors, and no new component SCSS without documented technical need. Reference images show both light and dark empty/list states and disabled action labels in empty state. They are visual guidance, not proof of API fields; example order text is placeholder data.

Bell: translated accessible name, `aria-haspopup`, `aria-expanded`, `aria-controls`. Panel: heading and labelled region/dialog semantics appropriate to the chosen overlay. Menu: keyboard reachable trigger, focusable actions, Escape/outside close, correct disabled mark-read state, focus return. Provide visible focus rings, sufficient contrast, and logical inline alignment so RTL/LTR works without duplicate layouts. Ensure scrollable list and pagination remain usable at mobile widths. Do not request browser push permission on panel open.

Suggested keys under `NOTIFICATIONS`: `TITLE`, `EMPTY`, `LOADING`, `ERROR`, `RETRY`, `CLEAR_ALL`, `MARK_ALL_READ`, `MARK_READ`, `DELETE`, `ITEM_ACTIONS`, `CLOSE`, and any confirmation text actually used. Use the existing `| translate` pipe in templates; keep dynamic backend title/message as data unless backend supplies localization semantics.

## 7. Verification strategy

Use the `roseApp` Nx targets (Vitest): `npm exec nx run roseApp:test`, `npm exec nx run roseApp:lint`, `npm exec nx run roseApp:typecheck`, and `npm exec nx run roseApp:build` when implementation exists. Focused tests should cover exact HTTP methods/URLs/query/body and response parsing; count source; duplicate mutation suppression; page deletion boundary; initial loading vs empty/error; menu exclusivity/outside/Escape/focus; logged-out reset; RTL and translations. Run a manual viewport/theme/language check after UI implementation. Check `git diff --check` and review all changed files. Documentation-only work requires document/link/status review, not application tests.

## 8. Risks, dependencies, and execution

1. The supplied screenshots show collapsed OpenAPI endpoint rows. Notification item fields (`id`, `title`, `message`, `isRead` are indicated by UX but not proven by a response schema), ID type, mutation responses, and push schemas are not documented. Task 01 must obtain actual schema or a backend fixture before implementation. If unavailable, stop dependent implementation and report the missing contract.
2. `Navbar` has a dormant count input and a home-navigation bell handler. Header integration must replace that behavior without changing account, search, cart, theme, language, or mobile navigation.
3. The app has no service worker registration, PushManager usage, or push subscription utility in the relevant source/configuration. Web Push is a separate optional workstream requiring confirmed schemas and a user-triggered permission UX.
4. `SharedPagination` currently emits a zero-based `page` value despite its interface naming; task 03 must account for this or use `@org/ui` `Pagination`, which emits one-based pages.
5. The global loading interceptor affects all HTTP calls; panel requests should opt out and render local loading while preserving global auth/error handling.

Execution order: [TASK-01](./tasks/TASK-01-contract-and-api.md) → [TASK-02](./tasks/TASK-02-state.md) → [TASK-03](./tasks/TASK-03-panel-ui.md) → [TASK-04](./tasks/TASK-04-header-integration.md) → [TASK-05](./tasks/TASK-05-final-verification.md). Do not overlap file ownership across agents. [Master execution prompt](./master-prompt.md).
