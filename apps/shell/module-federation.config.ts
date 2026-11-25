import type { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'shell',
  // Keep icons tree-shakeable instead of sharing the full catalog.
  shared: (packageName, sharedConfig) =>
    packageName === '@lucide/angular' ? false : sharedConfig,
  // The shell never imports rxjs-interop itself, so it would not be shared and each
  // remote would load its own copy (with duplicated Angular core internals), breaking DI
  // (e.g. "No provider found for ChangeDetectionScheduler" from toSignal/toObservable).
  // Tuple form is required: Nx silently ignores secondary entry points passed as strings.
  additionalShared: [
    [
      '@angular/core/rxjs-interop',
      { singleton: true, strictVersion: true, requiredVersion: '21.2.25' },
    ],
  ],
  /**
   * To use a remote that does not exist in your current Nx Workspace
   * You can use the tuple-syntax to define your remote
   *
   * remotes: [['my-external-remote', 'https://nx-angular-remote.netlify.app']]
   *
   * You _may_ need to add a `remotes.d.ts` file to your `src/` folder declaring the external remote for tsc, with the
   * following content:
   *
   * declare module 'my-external-remote';
   *
   */
  remotes: [],
};

/**
 * Nx requires a default export of the config to allow correct resolution of the module federation graph.
 **/
export default config;