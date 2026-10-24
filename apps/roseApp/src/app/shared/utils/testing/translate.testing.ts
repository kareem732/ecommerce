import { TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import en from '../../../../../public/i18n/en.json';

export const provideTranslateTesting = () => provideTranslateService();

export function useEnglish(): void {
  const translate = TestBed.inject(TranslateService);
  translate.setTranslation('en', en);
  translate.use('en');
}
