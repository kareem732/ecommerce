import type { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'adminDashboard',
  // Keep icons tree-shakeable instead of sharing the full catalog.
  shared: (packageName, sharedConfig) =>
    packageName === '@lucide/angular' ? false : sharedConfig,
  exposes: {
    './Routes': 'apps/adminDashboard/src/app/remote-entry/entry.routes.ts',
  },
};

/**
 * Nx requires a default export of the config to allow correct resolution of the module federation graph.
 **/
export default config;
