---
trigger: model_decision
description: Apply when a task touches API integration, authentication, authorization, tokens, signal stores, request state, notifications, error handling, theme, or Arabic/English localization.
---

# API, Authentication, State, and Localization

## API contracts
- Inspect the actual endpoint definitions, DTOs, service interface, and existing calling code before changing requests.
- Reuse current API clients and domain services. Do not invent endpoint URLs, request fields, response shapes, or backend capabilities.
- For storefront product operations, inspect `ShopService` implementing `ShopApi` and the existing `EndPoints.ts` before changing product requests.

## Authentication and security
- For auth tasks, inspect `packages/auth-service`, including `AuthApiService`, flow services, `TokenService`, `SessionService`, `provide-auth.ts`, interceptors, guards, and error mapping as applicable.
- Preserve current auth endpoint exclusions and centralized 401/error behavior unless the task explicitly requires changing it.
- Do not change token storage or lifecycle as a side effect of an unrelated UI task. The inspected implementation uses localStorage for JWT-related handling; assess the real backend contract and threat model before proposing a change.
- Never hardcode credentials, expose secrets, bypass authorization, or claim client-side role checks secure a backend resource.

## State and requests
- For auth feature state, follow existing `@ngrx/signals` stores, `withRequestState()`, and `rxMethod` patterns when appropriate.
- Reuse `NotificationService` and `ToastHost` for notifications and `FormErrorService`/existing validators for forms where applicable.
- Handle cancellation, duplicate submits, request failures, and race conditions when relevant. Do not add a competing state architecture.

## Localization and theme
- Reuse `LanguageService` from `@org/shared-i18n` for Arabic/English and document direction; do not implement a parallel language switcher.
- Reuse `ThemeService` and `ThemeToggle` from `@org/theme` where suitable.
- Use established translation keys and localized validation messages. Do not hardcode UI copy if the feature follows translation-based UI.
- Preserve existing RTL/LTR and dark-mode behavior.
