import type { I18nConfig } from '@org/shared-i18n';

declare const __webpack_public_path__: string;

export const i18nConfig: I18nConfig = {
  storageKey: 'adminDashboard.language',
  prefix: `${typeof __webpack_public_path__ === 'string' ? __webpack_public_path__ : './'}i18n/`,
};
