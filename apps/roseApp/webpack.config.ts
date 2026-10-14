import { withModuleFederation } from '@nx/module-federation/angular';
import type { Configuration } from 'webpack';
import config from './module-federation.config';

export default async (webpackConfig: Configuration) => {
  const applyFederation = await withModuleFederation(config, { dts: false });
  const federatedConfig = applyFederation(webpackConfig);

  // Angular injects styles.js as a classic script, which cannot use import.meta.
  federatedConfig.output = {
    ...federatedConfig.output,
    publicPath: 'http://localhost:4202/',
  };
  return federatedConfig;
};
