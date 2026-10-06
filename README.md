# Rose App

An Angular microfrontend workspace managed by Nx. The shell loads two remote applications through dynamic Module Federation.

This is the project's development foundation. The applications currently display the generated Nx welcome screens; business features have not been implemented yet.

## 1. Requirements

| Requirement | Recommended Setup                                       |
| ----------- | ------------------------------------------------------- |
| Node.js     | `22.23.3` (the version used to validate this workspace) |
| npm         | `10.9.9` (the version used during setup)                |
| Git         | For cloning the repository and submitting changes       |
| Browser     | A current Chrome, Edge, Firefox, or Safari              |
| Local ports | `4200`, `4201`, and `4202` must be available            |

Angular 21 supports Node.js `^20.19.0`, `^22.12.0`, or `^24.0.0`. Use the recommended Node 22 setup for consistency. See [Angular version compatibility](https://angular.dev/reference/versions).

No global Nx or Angular CLI installation is required. Commands use the workspace's installed tools. No backend, database, or environment variables are required for the current welcome screens.

## 2. Quick Start

Clone the shared repository into a folder named `Rose-App`, then run:

```bash
cd Rose-App
npm ci --legacy-peer-deps
npm exec -- nx serve shell --devRemotes=adminDashboard,roseApp
```

Run all commands in this document from the workspace root, where `package.json` and `nx.json` are located.

Use `npm ci` for an existing checkout: it installs the versions recorded in `package-lock.json`. The lockfile was created with `--legacy-peer-deps`, so keep that flag when installing. This does not replace checking package compatibility before adding dependencies.

| Application      | Role             | Local URL                               |
| ---------------- | ---------------- | --------------------------------------- |
| `shell`          | Host application | [localhost:4200](http://localhost:4200) |
| `adminDashboard` | Admin remote     | [localhost:4201](http://localhost:4201) |
| `roseApp`        | Rose remote      | [localhost:4202](http://localhost:4202) |

Inside the shell, visit `/adminDashboard` or `/roseApp` to load a remote. The same serve command starts all three applications with live reloading. Stop it with `Ctrl+C`.

## 3. Project Structure

```text
Rose-App/
|-- apps/
|   |-- shell/
|   |   |-- public/module-federation.manifest.json
|   |   |-- src/app/app.routes.ts
|   |   |-- src/app/app.config.ts
|   |   |-- src/styles.scss
|   |   |-- module-federation.config.ts
|   |   |-- project.json
|   |   `-- vite.config.mts
|   |-- adminDashboard/
|   |   |-- src/app/remote-entry/
|   |   |-- src/app/app.config.ts
|   |   |-- src/styles.scss
|   |   |-- module-federation.config.ts
|   |   |-- webpack.config.ts
|   |   `-- webpack.prod.config.ts
|   `-- roseApp/                  # Same remote layout
|-- styles/tailwind.css           # Shared Tailwind entry
|-- .postcssrc.json               # Tailwind PostCSS plugin
|-- eslint.config.mjs             # Lint rules and module boundaries
|-- nx.json                      # Task defaults and generator settings
|-- tsconfig.base.json           # Shared TypeScript settings and aliases
|-- package.json
`-- package-lock.json
```

There is currently no `libs/` or `packages/` directory. The temporary shared library used to validate services and shared state was removed after testing. Future shared libraries can live under `packages/shared/`.

### How the Applications Connect

1. The shell reads `apps/shell/public/module-federation.manifest.json`.
2. `apps/shell/src/main.ts` registers the remote URLs using `@module-federation/enhanced/runtime`.
3. The shell's `app.routes.ts` loads `adminDashboard/Routes` or `roseApp/Routes` on navigation.
4. Each remote exposes its route configuration through `module-federation.config.ts`.

The development manifest points to `http://localhost:4201/mf-manifest.json` and `http://localhost:4202/mf-manifest.json`. The Vercel build replaces these in the deployment output with same-origin remote paths. To deploy remotes independently instead, use their deployed manifest URLs.

## 4. Installed Stack

| Library / Tool            | Version                  | Purpose                                                                  |
| ------------------------- | ------------------------ | ------------------------------------------------------------------------ |
| Angular                   | `21.2.25`                | Standalone components, routing, forms, dependency injection, and signals |
| Nx and Angular Nx plugins | `23.2.0`                 | Workspace management, generators, task orchestration, and caching        |
| TypeScript                | `5.9.3`                  | Application types and compile-time checks                                |
| PrimeNG                   | `21.1.10`                | Angular UI components                                                    |
| `@angular/cdk`            | `21.2.14`                | Angular utilities required by PrimeNG                                    |
| `@primeuix/themes`        | `2.0.3`                  | Aura theme and design tokens                                             |
| Tailwind CSS              | `4.3.3`                  | Utility classes for layout and styling                                   |
| `@tailwindcss/postcss`    | `4.3.3`                  | Tailwind build integration                                               |
| PostCSS                   | `8.5.29`                 | CSS processing                                                           |
| `tailwindcss-primeui`     | `0.6.1`                  | Tailwind utilities linked to PrimeNG tokens                              |
| `@lucide/angular`         | `1.52.0`                 | Tree-shakeable SVG icons                                                 |
| RxJS                      | `7.8.2` in the lockfile  | Observable streams and asynchronous workflows                            |
| Vitest                    | `4.1.11` in the lockfile | Unit tests                                                               |
| AnalogJS testing packages | `2.6.3`                  | Angular integration for Vite and Vitest                                  |
| Vite                      | `8.0.9`                  | Test tooling; application builds use Webpack                             |
| ESLint / Prettier         | See `package-lock.json`  | Linting and formatting                                                   |

Supporting packages include `@module-federation/enhanced`, Webpack tooling, `zone.js`, SWC, and TypeScript helpers. The complete dependency list is in `package.json`; the lockfile records exact installed versions.

The manifest also retains template dependencies such as Express, Supertest, Angular SSR packages, and Nx Docker/Node plugins. They do not represent an active backend, SSR setup, or Docker application in the current workspace.

Keep Angular on major version 21 while using PrimeNG 21. Update Angular, its CLI/build packages, CDK, and PrimeNG together when planning a major upgrade.

## 5. Setup History

These are the steps applied to prepare this project, in order. They are historical setup steps, not commands a new contributor needs to repeat.

1. **Started with the Nx Angular template.** The initial command was `npx create-nx-workspace@22.6.0 Rose-App`. Template installation initially failed with npm's `Cannot read properties of null (reading 'edgesOut')` error. Dependency installation was recovered using `--legacy-peer-deps`. The installed template used Nx `23.2.0`, not the scaffold command's version.
2. **Generated the host and two dynamic remotes:**

   ```bash
   npm exec -- nx g @nx/angular:host apps/shell --remotes=adminDashboard,roseApp --dynamic
   ```

3. **Removed E2E testing.** E2E projects, their configuration, and direct test dependencies were removed. Application, host, and remote generator defaults now use `e2eTestRunner: none`.
4. **Switched application styles to SCSS.** Global and component styles were renamed, their references updated, and generator defaults set to `scss`.
5. **Validated libraries, services, and shared state.** A temporary shared Angular library and signal-based service were tested across the shell and both remotes. Module-boundary tags were configured, remote selectors corrected, and development CORS/public-path settings adjusted. The temporary library, test UI, and test-only changes were then removed.
6. **Aligned Angular with PrimeNG 21.** The template initially used Angular 22. Angular framework and CLI/build packages were changed to `21.2.25`, CDK to `21.2.14`, Angular ESLint to `21.4.0`, and TypeScript to `5.9.3`.
7. **Installed PrimeNG, Tailwind, and Lucide.** Versions are listed above. Aura was configured in all three applications.
8. **Connected the styling tools.** Added the root PostCSS configuration, the shared Tailwind CSS entry, PrimeUI utilities, and a consistent CSS layer order. SCSS remains the application styling format.
9. **Adjusted Module Federation sharing and caching.** Lucide is bundled per application rather than shared as its entire icon catalog. Nx build inputs include shared styling configuration and scanned source files.
10. **Verified the result and removed temporary examples.** Production builds, linting, type checks, shell unit tests, and browser checks passed. PrimeNG buttons and switches, Tailwind utilities, and Lucide icons were tested both standalone and inside the shell. The temporary UI was removed and the checks repeated.

## 6. Using the Libraries

### PrimeNG, Tailwind, and Lucide

The following standalone component demonstrates all three together:

```typescript
import { Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { LucideCircleCheck } from '@lucide/angular';

@Component({
  selector: 'app-save-action',
  imports: [ButtonModule, LucideCircleCheck],
  template: `
    <div class="flex items-center gap-3 p-4">
      <p-button label="Save" (onClick)="saved.set(true)" />

      @if (saved()) {
        <span class="inline-flex items-center gap-2 text-primary">
          <svg lucideCircleCheck aria-hidden="true"></svg>
          Saved
        </span>
      }
    </div>
  `,
})
export class SaveAction {
  readonly saved = signal(false);
}
```

Import `SaveAction` into the parent component's `imports` array and render `<app-save-action />` in its template. This is a documentation example, not a component already present in the repository.

**PrimeNG:** Import each component module from its specific entry point, such as `primeng/button`. Each application's `app.config.ts` already registers `providePrimeNG` with Aura. Forms-based controls using `ngModel` also need `FormsModule` in the consuming component.

**Tailwind:** Add complete utility class names directly to templates. Do not construct partial class names such as `'bg-' + color + '-600'`; the scanner cannot reliably detect them. See [Tailwind class detection](https://tailwindcss.com/docs/detecting-classes-in-source-files).

**PrimeUI:** Utilities such as `text-primary` and `bg-primary` use PrimeNG design tokens, so they follow the configured theme.

**Lucide:** Import only the icons needed from `@lucide/angular` and render them with their SVG directives. This project uses the new package, not `lucide-angular`. Decorative icons should use `aria-hidden="true"`; icon-only buttons still need an accessible label. See [Lucide Angular usage](https://lucide.dev/guide/angular/getting-started).

### SCSS and Theme Configuration

Use `apps/<app>/src/styles.scss` for application-wide styles and component `.scss` files for local styles. Tailwind's entry stays in `styles/tailwind.css` because [Tailwind v4 is not designed to run through Sass](https://tailwindcss.com/docs/compatibility).

The shared entry scans `apps/` and future `packages/` libraries. All three builds load it before their own `styles.scss`.

PrimeNG and Tailwind use this layer order:

```css
@layer theme, base, primeng, components, utilities;
```

Keep this order synchronized with the `cssLayer` setting in each application's `app.config.ts`. Customize Aura through PrimeNG presets/tokens rather than editing dependency files.

### Angular and RxJS

Use Angular Router for navigation, `inject()` for services, and signals for simple synchronous UI state. Import standalone components, pipes, and form modules in the component that uses them.

Use RxJS for observable workflows such as HTTP responses, form changes, and event streams. Angular's `AsyncPipe` can render an observable and manage its subscription; import it from `@angular/common` in the consuming component. HTTP features require adding `provideHttpClient()` to the application's providers first; it is not configured yet.

### Future Shared Libraries and Services

To add a shared library when a feature needs one:

```bash
npm exec -- nx g @nx/angular:library packages/shared/state --name=shared-state --importPath=@rose/shared-state --tags=scope:shared --style=scss --unitTestRunner=vitest-analog --no-interactive
```

The `scope:shared` tag allows the shell and both remotes to import the library. Their application tags are `scope:shell`, `scope:admin-dashboard`, and `scope:rose-app`; ESLint enforces these boundaries.

For a small shared store, export a service like this from the library's `src/index.ts`:

```typescript
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SharedState {
  private readonly countValue = signal(0);
  readonly count = this.countValue.asReadonly();

  increment(): void {
    this.countValue.update((value) => value + 1);
  }
}
```

Consumers can import `SharedState` from `@rose/shared-state` and access it with `inject(SharedState)`. Keep the library shared as a singleton in Module Federation and do not re-provide the service in components or routes, which would create separate instances.

Shared in-memory state applies when remotes run inside the shell's Angular application. Opening the three standalone applications in separate tabs creates separate application instances; use a backend or an explicit cross-tab mechanism if state must synchronize between them.

## 7. Development Commands

```bash
# List projects and inspect the dependency graph
npm exec -- nx show projects
npm exec -- nx graph

# Build, lint, and type-check all three applications
npm exec -- nx run-many --targets=build,lint,typecheck --projects=shell,adminDashboard,roseApp --parallel=3

# Run the existing shell unit tests
npm exec -- nx test shell

# Check documentation formatting
npm exec -- prettier --check README.md
```

Build output is written to `dist/apps/<app>/`.

The shell currently has three unit tests. Both remotes have Vitest configuration but no test files yet; add tests before expecting their test targets to pass. There are no committed E2E suites.

## 8. Contributing and Troubleshooting

- Make changes in the relevant application; place genuinely reusable code in a tagged shared library.
- Keep SCSS for application/component styles and use the shared CSS entry for Tailwind.
- When changing dependencies, use `npm install --legacy-peer-deps` and commit both `package.json` and `package-lock.json`.
- Run the build/lint/typecheck command and shell tests before submitting changes. Add focused tests for new behavior.
- Keep manifests, ports, CORS headers, and remote development `publicPath` values consistent. If a port changes, changing only the serve command is not enough.

**PowerShell blocks `npm.ps1`:** Run the commands from Command Prompt, or prefix them with `cmd /c` in PowerShell, for example `cmd /c npm ci --legacy-peer-deps`.

**Install errors:** Confirm Node/npm versions and use `npm ci --legacy-peer-deps`. Do not upgrade Angular independently to bypass peer-dependency errors.

**Remote fails to load:** Make sure all three servers are running and check the shell's manifest URLs. The remote development configurations currently use fixed `http://localhost:4201/` and `http://localhost:4202/` public paths.

**Stale Nx results:** Stop the dev server, run `npm exec -- nx reset`, then restart the normal serve command.

**CI:** The existing GitHub Actions workflow is inherited from the template. Before relying on it, align its install command with `--legacy-peer-deps`, configure Nx Cloud if using its distributed tasks, and handle remote test targets that currently have no test files. These requirements are not automatically handled by this README.

## 9. Vercel Deployment

This workspace uses Nx, not a standalone Angular CLI workspace. Do not use `ng build`: there is no `angular.json` at the repository root.

Deploy all three applications as one Vercel project connected to this repository. The root `vercel.json` configures the build and SPA routing.

| Vercel Setting   | Value                                                                             |
| ---------------- | --------------------------------------------------------------------------------- |
| Root Directory   | Repository root (leave the field empty; do not choose `apps/shell` or `Rose-App`) |
| Framework Preset | Other                                                                             |
| Install Command  | `npm ci --legacy-peer-deps`                                                       |
| Build Command    | `npm run build:vercel`                                                            |
| Output Directory | `dist/vercel`                                                                     |
| Node.js Version  | `22.x`                                                                            |

The GitHub repository already contains the contents of the local `Rose-App` folder at its root. The configuration file overrides the framework/build settings, but the dashboard's Root Directory must still point to that root.

Test the production packaging locally:

```bash
npm run build:vercel
```

`tools/build-vercel.mjs` builds the shell and both remotes in production mode, gives the remotes their deployment base URLs, and assembles this static output:

```text
dist/vercel/
|-- index.html
|-- module-federation.manifest.json
|-- remotes/
|   |-- adminDashboard/
|   |   |-- index.html
|   |   |-- mf-manifest.json
|   |   `-- remoteEntry.mjs
|   `-- roseApp/
|       |-- index.html
|       |-- mf-manifest.json
|       `-- remoteEntry.mjs
`-- ... application chunks, styles, and assets
```

The shell remains at `/`, with federated routes at `/adminDashboard` and `/roseApp`. Standalone remotes are available at `/remotes/adminDashboard/` and `/remotes/roseApp/`. Relative manifest entries resolve against the current origin, so both Vercel previews and production domains work without hard-coded deployment URLs or cross-origin CORS setup.

After pushing deployment changes, deploy the latest commit. Redeploying the old failed commit will still use its old configuration. If the build log still shows `ng build`, check the commit being deployed and the Root Directory.

See [Vercel build settings](https://vercel.com/docs/builds/configure-a-build) and [Vercel file-based configuration](https://vercel.com/docs/project-configuration/vercel-json).

## References

- [Nx Angular documentation](https://nx.dev/docs/technologies/angular/introduction)
- [Angular documentation](https://angular.dev)
- [PrimeNG 21 documentation](https://v21.primeng.org)
- [Tailwind CSS documentation](https://tailwindcss.com/docs)
- [Lucide Angular documentation](https://lucide.dev/guide/angular/getting-started)
- [RxJS documentation](https://rxjs.dev/guide/overview)
- [Vitest documentation](https://vitest.dev/guide/)
