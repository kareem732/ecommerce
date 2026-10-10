import { withModuleFederation } from '@nx/module-federation/angular';
import type { Configuration } from 'webpack';
import config from './module-federation.config';

/**
 * DTS Plugin is disabled in Nx Workspaces as Nx already provides Typing support for Module Federation
 * The DTS Plugin can be enabled by setting dts: true
 * Learn more about the DTS Plugin here: https://module-federation.io/configure/dts.html
 */
const federated = withModuleFederation(config, { dts: false });

export default async (webpackConfig: Configuration) => {
  const updatedConfig = (await federated)(webpackConfig);
  // The shell is the host served from the root. A fixed publicPath avoids the
  // 'auto' runtime emitting `import.meta.url` into the classic styles.js script.
  updatedConfig.output = { ...updatedConfig.output, publicPath: '/' };
  return updatedConfig;
};
