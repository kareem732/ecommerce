# Shared i18n

English/Arabic runtime translation for `roseApp` and `adminDashboard` using
`@ngx-translate/core` and `@ngx-translate/http-loader` 18.0.0.
The checkout has no `apps/dashboard`; the dashboard project is `adminDashboard`.

## Architecture and repository evidence

The repository README designates `packages/shared/` for future shared libraries.
There was no existing core/shared library, HttpClient provider, or translation
infrastructure to reuse. Both applications use standalone Angular 21.2.25,
Nx 23.2.0, strict TypeScript 5.9.3, PrimeNG 21, Tailwind 4, and Vitest/Analog.
The working tree was clean before this change. Only the root AGENTS.md applies.
There are no SSR or hydration bootstrap paths despite server packages being installed.

This non-buildable Angular library is tagged `scope:shared,type:util` and imported
as `@org/shared-i18n`. Both applications depend on it; it depends on neither app.
This follows the existing scope-based ESLint boundaries. Application-local copies
of LanguageService would duplicate state, persistence and error handling.

Each app retains its own `app.config.ts`, router and PrimeNG providers. It adds
HttpClient once, `provideI18n(i18nConfig)` and an awaited `provideAppInitializer`.
Lazy features inherit those providers without registering translation services.

The shell imports each remote's `remoteRoutes` without executing its bootstrap.
Those routes therefore establish a separate i18n boundary and await initialization
in a resolver. Standalone `appRoutes` uses `localRoutes` instead, avoiding duplicate
providers. No route URLs or shell sources change. Revisiting a cached remote route
reapplies its language and direction to the document.

| Application    | Preference key            | Translation source                             |
| -------------- | ------------------------- | ---------------------------------------------- |
| roseApp        | `roseApp.language`        | `apps/roseApp/public/i18n/{en,ar}.json`        |
| adminDashboard | `adminDashboard.language` | `apps/adminDashboard/public/i18n/{en,ar}.json` |

The existing public-asset globs already copy these resources. Each app supplies
its own Webpack public path as the loader prefix; using the shell's document base
would request the wrong files when a remote is hosted on another origin or path.
The shared library has no Webpack dependency. A relative prefix is used by tests.
There is no separate shared dictionary: the only repeated content is a language
button label, which does not justify another resource, merge policy or request.

## Language lifecycle

- `currentLang`, `isRTL`, `direction`, `loading` and `loadError` are read-only signals.
- Initialization validates storage values, defaults to Arabic (`ar`), loads the Arabic
  fallback once, and then activates a saved English preference.
- A failed English load retains Arabic. Failed runtime switches retain the active
  language, expose `loadError`, and report to Angular's ErrorHandler.
- Failure to load the essential Arabic dictionary rejects initialization so an
  application is not silently bootstrapped with missing translation keys. A later
  initialization call can retry. There are no fabricated fallback dictionaries.
- Successful switches update HTML `lang`/`dir` and the app's storage key without a
  page reload. Repeated requests reuse ngx-translate's cache; concurrent requests
  for the same language share work, and the latest requested language wins.
- Storage failures are reported but do not prevent translation. Server execution
  does not access localStorage. Preference changes are not synchronized across apps
  or tabs via storage listeners.

## Developer usage

Import the official pipe directly into each standalone component that needs it:

```ts
import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '@org/shared-i18n';

@Component({
  selector: 'app-greeting',
  imports: [TranslatePipe],
  template: `
    <h1>{{ 'HOME.GREETING' | translate: { name: userName } }}</h1>
    <button (click)="language.changeLanguage('ar')" [disabled]="language.loading()">العربية</button>
    <span>{{ language.currentLang() }}</span>
  `,
})
export class Greeting {
  readonly language = inject(LanguageService);
  readonly userName = 'Sam';
}
```

Add matching namespaced keys to the consuming app's JSON files, for example:

```json
{ "HOME": { "GREETING": "Hello {{name}}" } }
```

```json
{ "HOME": { "GREETING": "مرحبًا {{name}}" } }
```

An absent English key falls back to Arabic. A key absent in both files is returned
as the key by ngx-translate. Keep interpolation parameter names identical.
Call `language.changeLanguage('en')` directly; it returns `void` and manages its
subscription with `takeUntilDestroyed`. Read `loading()` and `loadError()` for status.
`initialize()` returns a shared, finite `Observable<void>` that Angular subscribes to
in the existing application initializer or route resolver. It does not load files
until subscribed, and failed initialization can be retried. The service uses RxJS
without `async`, `await`, or Promise conversions.
Use `language.currentLang()`, `language.isRTL()` and `language.direction()` in templates or `computed()`.
`LanguageEnum` and `DirectionEnum` are exported from `@org/shared-i18n`;
`changeLanguage(LanguageEnum.Arabic)` and `changeLanguage('ar')` are both supported.
The service updates HTML attributes using Angular's Renderer2.
Change languages through LanguageService so translation, persistence and HTML state
stay aligned; direct TranslateService.use calls bypass that coordination.

For another standalone application, supply a unique key and its own asset prefix:

```ts
providers: [
  provideHttpClient(), // reuse this if the application already provides it
  provideI18n({ storageKey: 'anotherApp.language', prefix: '/i18n/' }),
  provideAppInitializer(() => inject(LanguageService).initialize()),
];
```

Import `provideHttpClient` from `@angular/common/http`, `inject` and
`provideAppInitializer` from `@angular/core`, and `provideI18n`/`LanguageService`
from `@org/shared-i18n`. Add English and Arabic public assets. A federated app should
follow the existing remotes' public-path configuration and separate route boundary,
including its resolver. Do not register providers again inside ordinary lazy features.

## Scope and limitations

RoseApp's auth language label is now an accessible button using TranslatePipe;
the auth root binds its direction instead of forcing LTR. Dashboard's existing
welcome heading demonstrates namespaced keys and interpolation, with a language
button beside it. The rest of the generated welcome screen is intentionally not
translated or redesigned.

Runtime language selection does not change Angular's `LOCALE_ID`, date, number or
currency pipes, or PrimeNG's internal locale messages. Future formatting consumers
should register Arabic locale data and pass the selected locale explicitly to
formatting pipes. No formatting consumers need alteration in this change.
Existing screens may still contain physical CSS properties; this is not a complete
RTL layout refactor. HTML direction is document-wide and follows the active remote;
concurrently displayed independent remotes would additionally need local host
`lang`/`dir` boundaries. Full SSR would require an absolute server resource URL and
an explicit server/client preference and hydration strategy.

## Verification

Use the existing npm/Nx targets:

```sh
npx nx run-many -t lint typecheck test -p shared-i18n roseApp adminDashboard
npx nx run-many -t build -p roseApp adminDashboard --configuration=production
npx nx build shell --configuration=production
```

Focused tests use the real TranslateService, HTTP loader, pipe, and HTTP testing
backend. They cover initialization, storage, invalid preferences, interpolation,
missing-key fallback, failures/retry, concurrent switching, SSR storage guards,
independent providers, both standalone integrations and lazy federated routing.
Before the change, both apps passed lint/typecheck/build and RoseApp passed tests;
Dashboard's test target had no test files. Its new integration tests now exercise it.

## File inventory

All changed and created files are listed below. No shell sources, global styles,
application asset configurations or unrelated dependency versions were changed.

| File                                                            | Purpose                                                                          |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `apps/adminDashboard/public/i18n/ar.json`                       | Application-owned English or Arabic dictionary.                                  |
| `apps/adminDashboard/public/i18n/en.json`                       | Application-owned English or Arabic dictionary.                                  |
| `apps/adminDashboard/src/app/app.config.ts`                     | Root HttpClient, i18n providers and awaited initialization.                      |
| `apps/adminDashboard/src/app/app.routes.ts`                     | Standalone routes inherit the existing root i18n scope.                          |
| `apps/adminDashboard/src/app/i18n.config.ts`                    | App-specific preference key and remote asset prefix.                             |
| `apps/adminDashboard/src/app/remote-entry/entry.routes.spec.ts` | Focused service, component or routing integration tests.                         |
| `apps/adminDashboard/src/app/remote-entry/entry.routes.ts`      | Isolated federated providers and initialization resolver; shared local routes.   |
| `apps/adminDashboard/src/app/remote-entry/entry.spec.ts`        | Focused service, component or routing integration tests.                         |
| `apps/adminDashboard/src/app/remote-entry/nx-welcome.ts`        | Dashboard greeting/interpolation and language button.                            |
| `apps/roseApp/public/i18n/ar.json`                              | Application-owned English or Arabic dictionary.                                  |
| `apps/roseApp/public/i18n/en.json`                              | Application-owned English or Arabic dictionary.                                  |
| `apps/roseApp/src/app/app.config.ts`                            | Root HttpClient, i18n providers and awaited initialization.                      |
| `apps/roseApp/src/app/app.routes.ts`                            | Standalone routes inherit the existing root i18n scope.                          |
| `apps/roseApp/src/app/features/auth/auth.html`                  | RoseApp language button, official pipe and dynamic direction.                    |
| `apps/roseApp/src/app/features/auth/auth.spec.ts`               | Focused service, component or routing integration tests.                         |
| `apps/roseApp/src/app/features/auth/auth.ts`                    | RoseApp language button, official pipe and dynamic direction.                    |
| `apps/roseApp/src/app/i18n.config.ts`                           | App-specific preference key and remote asset prefix.                             |
| `apps/roseApp/src/app/remote-entry/entry.routes.ts`             | Isolated federated providers and initialization resolver; shared local routes.   |
| `package-lock.json`                                             | Locks the two new packages; existing package entries are unchanged.              |
| `package.json`                                                  | Pins the two ngx-translate dependencies.                                         |
| `packages/shared/i18n/README.md`                                | Architecture, usage, file inventory, verification and limitations.               |
| `packages/shared/i18n/eslint.config.mjs`                        | Library lint rules following the workspace Angular conventions.                  |
| `packages/shared/i18n/project.json`                             | Nx library identity, scope tags and lint target.                                 |
| `packages/shared/i18n/src/index.ts`                             | Public library exports.                                                          |
| `packages/shared/i18n/src/lib/i18n.config.ts`                   | Typed library configuration token.                                               |
| `packages/shared/i18n/src/lib/language.service.spec.ts`         | Focused service, component or routing integration tests.                         |
| `packages/shared/i18n/src/lib/language.enums.ts`                | Public language and direction enums.                                             |
| `packages/shared/i18n/src/lib/language.service.ts`              | Signals, language loading, persistence, document direction and failure handling. |
| `packages/shared/i18n/src/lib/provide-i18n.ts`                  | Reusable modern ngx-translate provider configuration.                            |
| `packages/shared/i18n/src/test-setup.ts`                        | Generated Angular Vitest setup using the existing framework.                     |
| `packages/shared/i18n/tsconfig.json`                            | Strict library or test TypeScript configuration.                                 |
| `packages/shared/i18n/tsconfig.lib.json`                        | Strict library or test TypeScript configuration.                                 |
| `packages/shared/i18n/tsconfig.spec.json`                       | Strict library or test TypeScript configuration.                                 |
| `packages/shared/i18n/vite.config.mts`                          | Existing Vitest/Analog convention with an explicit library test tsconfig.        |
| `tsconfig.base.json`                                            | Nx-generated shared library import alias.                                        |

## Recorded results (2026-10-10)

- Production builds: `roseApp`, `adminDashboard`, and the consuming `shell` passed.
- Nx lint and typecheck: both apps and `shared-i18n` passed. All three test
  tsconfigs also passed `tsc --noEmit` through `nx exec`.
- Unit/integration tests: 24 passed (20 library, 2 RoseApp, 2 dashboard).
- Chromium smoke checks passed against both production file servers and live
  development servers: standalone and shell-hosted loading, runtime switching,
  reload restoration, independent preferences, and cached-route direction recovery.
  Translation requests returned HTTP 200 from the correct remote origins, with
  no browser page errors. Temporary verification servers were stopped afterward.
- All four output dictionaries matched the source JSON files byte-for-byte.
- Nx graph: both apps have a static dependency on `shared-i18n`; the library has
  no project dependencies. No project cycles or cross-application dependency was added.
- Existing lockfile package records are unchanged; only the two new packages and
  root dependency declarations were added. `git diff --check` passed.

Non-failing output includes existing Nx tooling deprecations, generated welcome
component style-budget/unused-import warnings, and jsdom's inability to parse
PrimeNG CSS `@layer` rules. Tests remain enabled and the test infrastructure is unchanged.
Browser checks validate actual CSS-capable rendering separately.

API references: [ngx-translate configuration](https://ngx-translate.org/reference/configuration/)
and [Angular compatibility](https://ngx-translate.org/getting-started/installation/).
