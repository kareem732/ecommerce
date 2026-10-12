import { makeEnvironmentProviders } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { I18N_CONFIG, I18nConfig } from './i18n.config';
import { LanguageService } from './language.service';

export function provideI18n(config: I18nConfig) {
  return makeEnvironmentProviders([
    { provide: I18N_CONFIG, useValue: config },
    LanguageService,
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: config.prefix,
        failOnError: true,
      }),
    }),
  ]);
}
