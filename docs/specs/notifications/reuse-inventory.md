# Reuse inventory

| Capability | Existing implementation | Decision |
| --- | --- | --- |
| Bell, badge, responsive header | `apps/roseApp/src/app/core/components/navbar/navbar.ts`, `navbar.html` | Extend only bell binding/click/panel mount. Existing badge markup reusable. |
| Storefront host | `apps/roseApp/src/app/features/shop/shop.ts`, `shop.html` | Reuse; only touch if state binding cannot live in navbar. |
| Auth/session | `packages/auth-service/src/lib/services/session.service.ts`, `interceptors/auth.interceptor.ts`, `provide-auth.ts` | Reuse directly; no auth changes. |
| API URL and HTTP setup | `apps/roseApp/src/environments/environment.ts`, `apps/roseApp/src/app/app.config.ts`, `remote-entry/entry.routes.ts` | Reuse directly; create only a feature API client. |
| API envelope/pagination types | `apps/roseApp/src/app/features/shop/interfaces/home.model/home-model-response.ts` | Shape reusable; assess shop feature boundary before import. Feature-local aliases may be smaller/safer. |
| Error and success toasts | `packages/auth-service/src/lib/services/notification.service.ts`, `packages/ui/src/lib/toast-host/toast-host.ts`, `packages/auth-service/src/lib/interceptors/error.interceptor.ts` | Reuse for feedback. This service is toast state, not backend notification data. |
| Loading | `apps/roseApp/src/app/core/interceptors/loading.interceptor.ts`, `core/components/loading/loading.ts`; `packages/ui/src/lib/spinner/spinner.ts` | Reuse Spinner for panel; skip global overlay on panel queries using `skipLoading()`. |
| Menus/overlays | `packages/ui/src/lib/account-menu/account-menu.ts`; navbar's account dropdown; `apps/roseApp/src/app/shared/business/confirmation-dialog.service.ts` | AccountMenu does not fit an anchored per-row action menu directly. Reuse its interaction pattern; select installed PrimeNG/CDK overlay for unclipped row menu. Confirmation service is available for destructive action if needed. |
| Pagination | `packages/ui/src/lib/pagination/pagination.ts`; `apps/roseApp/src/app/shared/ui/shared-pagination/shared-pagination.ts` | Reuse one, with backend metadata. `Pagination` emits one-based page; `SharedPagination` currently emits zero-based page. |
| Buttons, badges, alert, icons | `packages/ui/src/index.ts`; `lucide-angular` already used by navbar | Reuse where suitable, no duplicate library components. |
| Search | `apps/roseApp/src/app/features/shop/services/product-search.service.ts` | Not applicable to notification search; only query normalization pattern reusable. No notification search UI shown. |
| Translation and direction | `apps/roseApp/public/i18n/en.json`, `ar.json`; `packages/shared/i18n/src/lib/language.service.ts`; `apps/roseApp/src/app/remote-entry/entry.ts` | Extend JSON keys; use existing `TranslatePipe` and direction. |
| Theme/tokens | `packages/theme`, `apps/roseApp/src/styles/_semantic.scss`, `_primitives.scss`, `styles/tailwind.css`, `app.config.ts` | Reuse semantic colors, Tailwind, PrimeNG theme. |
| Tests | `apps/roseApp/src/app/core/components/navbar/navbar.spec.ts`, `features/shop/stores/wishlist/wishlist.store.spec.ts`, `features/shop/services/shop.service.spec.ts` | Follow Vitest/TestBed/HttpTestingController conventions. |
| Web Push/PWA | No matching service worker, `ngsw`, PushManager, or subscription implementation found in `apps/roseApp`/shared source and build assets | New infrastructure would be needed; separate optional task, not panel scope. |
| Admin notification creation | No notification workflow found under `apps/adminDashboard/src/app` | Out of scope. |

Searches were limited to relevant apps, shared packages, configuration, and documentation. Verify again before implementation if the repository changes.
