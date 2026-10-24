<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->


<!-- SHARED ANGULAR NX INSTRUCTIONS START -->

# Angular + Nx Workspace Instructions

These instructions are shared by Antigravity and Codex. Keep them concise; consult the linked focused rules only when relevant to the task.

## How to execute tasks
1. Identify the task's observable behavior and acceptance criteria.
2. Check `git status --short` and inspect the relevant feature, nearby implementations, tests, and configuration. Do not read the entire repository by default.
3. Identify the owning Nx project and applicable library boundaries before adding imports or moving code.
4. Search for reusable UI, services, models, validators, form controls, state stores, API clients, translations, and design tokens.
5. Implement the smallest complete change using existing conventions. Proceed directly when the task is clear and safe; ask only if a missing decision materially blocks correct implementation.
6. Run relevant available verification and inspect the final diff. Report exact commands and real outcomes.

## Focused rule files
- Nx ownership, Module Federation, project tags, public entry points, dependency boundaries: `.agents/rules/nx-workspace.md`.
- Angular components, Signals, RxJS, forms, routing, lifecycle, and architecture: `.agents/rules/angular-architecture.md`.
- Templates, Tailwind, PrimeNG, accessibility, responsive design, design tokens, RTL/LTR: `.agents/rules/angular-ui.md` and `.agents/rules/angular-html-template.md`.
- API, authentication, state stores, notifications, translations, and theme: `.agents/rules/api-state-i18n.md`.
- Test runners, Nx targets, and verification: `.agents/rules/testing-verification.md`.

For Codex: these files are focused project references, not a claim that Codex supports Antigravity's YAML trigger system. Read a focused file when the task falls within its scope. For Antigravity, `.agents/rules/*.md` uses native rule triggers.

## Workspace facts — verify before relying on them
This repository was inspected with Angular 21.2.25, Nx 23.2.0, TypeScript 5.9.3, PrimeNG 21.1.10, Tailwind CSS 4.3.3, `@ngrx/signals` 21.1.1-range, `@ngx-translate` 18.0.0, and npm. These versions and facts can change; check `package.json`, lockfiles, and actual code if relevant.

### Projects
- `apps/shell`: Module Federation host.
- `apps/adminDashboard`: remote application.
- `apps/roseApp`: remote/customer storefront application.
- `packages/ui`: shared UI components (`@org/ui`).
- `packages/auth-service`: authentication and data-access abstractions (`@org/auth-service`).
- `packages/theme`: theme utilities (`@org/theme`).
- `packages/shared/i18n`: shared language/i18n (`@org/shared-i18n`).
- `packages/shared`: shared library (`@org/shared`).

### Workspace conventions
- npm is the package manager. The repository README says dependency installation requires `--legacy-peer-deps`; do not install dependencies unless needed and justified.
- Use the repository's scripts or `npm exec nx <command>` for Nx operations. Discover the affected project's actual targets instead of assuming every project has the same targets.
- Nx `@nx/enforce-module-boundaries` constraints are active. Current tags include `scope:shell`, `scope:admin-dashboard`, `scope:rose-app`, and `scope:shared`; verify `eslint.config.mjs` and the affected `project.json` before crossing boundaries.
- `shell` resolves remotes through Module Federation runtime/configuration. Do not replace remote loading with direct cross-application source imports.
- Share cross-app code through approved libraries and their public entry points (for example `@org/ui`, `@org/auth-service`, `@org/theme`, `@org/shared-i18n`) rather than importing private files from another app.

### Product and UI direction
- Customer-facing storefront features such as navbar, footer, catalog, and cart generally belong in `apps/roseApp` feature/layout areas. Put presentation-only components in `packages/ui` when they genuinely need to be reused across applications and library boundaries permit it.
- `packages/ui` already provides buttons, inputs, selects, textarea, phone and upload controls, checkbox, OTP, pagination, tabs, alerts, badges, breadcrumbs, cards, error messages, labels, spinner, account menu, and `ToastHost`. Inspect `packages/ui/src/index.ts` and the implementation before creating a substitute.
- Existing custom form controls implement ControlValueAccessor where applicable. Prefer these when compatible with the task.
- `packages/theme` contains `ThemeService`/`ThemeToggle`; `packages/shared/i18n` contains `LanguageService` for Arabic/English and RTL/LTR behavior.
- The workspace uses Tailwind CSS v4 with PrimeNG integration. Preserve the established layer order `@layer theme, base, primeng, components, utilities;`, PrimeNG's matching `cssLayer` configuration, theme presets, and design tokens. Prefer semantic CSS variables such as `--color-primary`, `--bg-surface`, and `--text-primary` over hardcoded colors.
- Use Tailwind for layout/spacing/responsive utilities and PrimeNG for suitable interactive widgets. Reuse `@org/ui` wrappers first when they provide the required behavior. No global assumption that a shared table or dialog wrapper exists: the inspection found no current `p-table`/`p-dialog` abstraction. Verify current code before introducing or selecting one.
- Support Arabic/English, RTL/LTR, and dark mode where relevant to the affected feature.

### State, API, and authentication
- For local synchronous component state, use Angular Signals when consistent with surrounding code. The workspace uses `@ngrx/signals` `signalStore`, `withRequestState()`, and `rxMethod` for complex auth feature state; follow this pattern when applicable rather than creating a parallel state framework.
- Reuse the existing `packages/auth-service` services, `provideAuth()` interceptors, guards, session/token abstractions, and auth error mapping for authentication tasks. Inspect contracts before changing authentication behavior.
- The storefront has `ShopService` implementing `ShopApi`, with endpoint definitions in its existing `EndPoints.ts`; inspect those files before modifying product API requests.
- Reuse `NotificationService`/`ToastHost`, `FormErrorService`, validators, and existing form patterns where applicable.
- Do not invent API endpoints, payloads, response types, auth semantics, or token lifecycle behavior.

## Non-negotiable quality constraints
- Follow the installed Angular/Nx versions and the actual repository's conventions; do not perform framework migrations as part of an unrelated task.
- Reuse existing components, services, validators, stores, translation keys, and tokens before creating equivalents.
- Do not add a UI framework, state-management package, or runtime dependency unless the task requires it or a concrete gap justifies it.
- Never bypass module boundaries, weaken tests/lint rules, remove unrelated changes, or claim unexecuted checks passed.


<!-- SHARED ANGULAR NX INSTRUCTIONS END -->
