import { InjectionToken } from '@angular/core';
import { LanguageEnum } from './language.enums';

export type Language = `${LanguageEnum}`;

export interface I18nConfig {
  readonly storageKey: string;
  readonly prefix: string;
}

export const I18N_CONFIG = new InjectionToken<I18nConfig>('I18N_CONFIG');

export function isLanguage(value: unknown): value is Language {
  return value === LanguageEnum.English || value === LanguageEnum.Arabic;
}
