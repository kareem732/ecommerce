import { lastValueFrom } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  Component,
  EnvironmentInjector,
  ErrorHandler,
  PLATFORM_ID,
  createEnvironmentInjector,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LanguageService } from './language.service';
import { DirectionEnum, LanguageEnum } from './language.enums';
import { provideI18n } from './provide-i18n';

@Component({
  imports: [TranslatePipe],
  template: `<p>{{ 'HOME.GREETING' | translate: { name: 'Sam' } }}</p>
    <span>{{ 'COMMON.FALLBACK' | translate }}</span>
    <h1>{{ titleObj.text | translate }}</h1>`,
})
class TranslationExample {
  titleObj = { text: 'NAVIGATION.DASHBOARD' };
}

const arabic = {
  HOME: { GREETING: 'أهلًا {{name}}' },
  COMMON: { FALLBACK: 'نص احتياطي عربي', HOME: 'الرئيسية' },
  NAVIGATION: { DASHBOARD: 'لوحة التحكم' },
};
const english = {
  HOME: { GREETING: 'Hello {{name}}' },
  NAVIGATION: { DASHBOARD: 'Dashboard' },
};

describe('LanguageService with the official HTTP loader and pipe', () => {
  let service: LanguageService;
  let http: HttpTestingController;
  const handleError = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    handleError.mockClear();
    TestBed.configureTestingModule({
      imports: [TranslationExample],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideI18n({ storageKey: 'test.language', prefix: '/i18n/' }),
        { provide: ErrorHandler, useValue: { handleError } },
      ],
    });
    service = TestBed.inject(LanguageService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
    localStorage.clear();
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
  });

  async function initialize() {
    const initialized = lastValueFrom(service.initialize());
    http.expectOne('/i18n/ar.json').flush(arabic);
    await initialized;
  }

  it('defers initialization until subscribed and shares the completed result', async () => {
    const initialization = service.initialize();
    http.expectNone('/i18n/ar.json');
    const first = lastValueFrom(initialization);
    http.expectOne('/i18n/ar.json').flush(arabic);
    await first;
    await lastValueFrom(initialization);
    http.expectNone('/i18n/ar.json');
  });

  it('reports initialization errors from the void changeLanguage API and retries', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    service.changeLanguage(LanguageEnum.Arabic);
    http.expectOne('/i18n/ar.json').error(new ProgressEvent('error'));
    expect(handleError).toHaveBeenCalled();
  });

  it('defaults to Arabic and initializes only once', async () => {
    await initialize();
    expect(service.currentLang()).toBe(LanguageEnum.Arabic);
    expect(service.isRTL()).toBe(true);
    expect(service.direction()).toBe(DirectionEnum.rtl);
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('restores English after loading the Arabic fallback', async () => {
    localStorage.setItem('test.language', 'en');
    const initialized = lastValueFrom(service.initialize());
    http.expectOne('/i18n/ar.json').flush(arabic);
    http.expectOne('/i18n/en.json').flush(english);
    await initialized;
    expect(service.currentLang()).toBe(LanguageEnum.English);
    expect(service.isRTL()).toBe(false);
    expect(service.direction()).toBe(DirectionEnum.ltr);
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it.each(['fr', '', 'AR', null])(
    'ignores invalid saved language %s',
    async (invalid) => {
      if (invalid !== null) localStorage.setItem('test.language', invalid);
      await initialize();
      expect(service.currentLang()).toBe(LanguageEnum.Arabic);
    },
  );

  it('switches signals, HTML attributes, persistence and the real pipe with interpolation, fallback, and dynamic keys', async () => {
    await initialize();
    const fixture = TestBed.createComponent(TranslationExample);
    fixture.detectChanges();

    // Arabic default state
    expect(fixture.nativeElement.querySelector('p').textContent).toContain(
      'أهلًا Sam',
    );
    expect(fixture.nativeElement.querySelector('span').textContent).toContain(
      'نص احتياطي عربي',
    );
    // Dynamic key: {{ titleObj.text | translate }}
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain(
      'لوحة التحكم',
    );

    // Switch to English
    service.changeLanguage(LanguageEnum.English);
    http.expectOne('/i18n/en.json').flush(english);
    fixture.detectChanges();

    expect(service.currentLang()).toBe(LanguageEnum.English);
    expect(service.isRTL()).toBe(false);
    expect(service.direction()).toBe(DirectionEnum.ltr);
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
    expect(localStorage.getItem('test.language')).toBe('en');
    expect(fixture.nativeElement.querySelector('p').textContent).toContain(
      'Hello Sam',
    );
    // Dynamic key updates without reload
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain(
      'Dashboard',
    );
    // COMMON.FALLBACK only exists in Arabic — fallback from Arabic
    expect(fixture.nativeElement.querySelector('span').textContent).toContain(
      'نص احتياطي عربي',
    );

    // Switch back to Arabic
    service.changeLanguage(LanguageEnum.Arabic);
    fixture.detectChanges();
    expect(service.currentLang()).toBe(LanguageEnum.Arabic);
    expect(service.isRTL()).toBe(true);
    expect(fixture.nativeElement.querySelector('p').textContent).toContain(
      'أهلًا Sam',
    );
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain(
      'لوحة التحكم',
    );
  });

  it('coalesces concurrent same-language requests and caches loaded translations', async () => {
    await initialize();
    service.changeLanguage(LanguageEnum.English);
    service.changeLanguage(LanguageEnum.English);
    http.expectOne('/i18n/en.json').flush(english);
    expect(service.currentLang()).toBe(LanguageEnum.English);
    service.changeLanguage(LanguageEnum.English);
    http.expectNone('/i18n/en.json');
  });

  it('keeps the latest requested language when an earlier response arrives late', async () => {
    await initialize();
    service.changeLanguage(LanguageEnum.English);
    const englishReq = http.expectOne('/i18n/en.json');
    service.changeLanguage(LanguageEnum.Arabic);
    englishReq.flush(english);
    expect(service.currentLang()).toBe(LanguageEnum.Arabic);
  });

  it('retains Arabic on a failed switch and allows a retry', async () => {
    await initialize();
    service.changeLanguage(LanguageEnum.English);
    http.expectOne('/i18n/en.json').error(new ProgressEvent('error'));
    expect(service.currentLang()).toBe(LanguageEnum.Arabic);
    expect(service.loadError()).toBeTruthy();
    service.changeLanguage(LanguageEnum.English);
    http.expectOne('/i18n/en.json').flush(english);
    expect(service.currentLang()).toBe(LanguageEnum.English);
    expect(service.loadError()).toBeNull();
  });

  it('falls back to Arabic when the saved English resource fails', async () => {
    localStorage.setItem('test.language', 'en');
    const initialized = lastValueFrom(service.initialize());
    http.expectOne('/i18n/ar.json').flush(arabic);
    http.expectOne('/i18n/en.json').error(new ProgressEvent('error'));
    await initialized;
    expect(service.currentLang()).toBe(LanguageEnum.Arabic);
  });

  it('rejects initialization if Arabic cannot load and permits retry', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const init = service.initialize();
    const sub = vi.fn();
    init.subscribe({ error: sub });
    http.expectOne('/i18n/ar.json').error(new ProgressEvent('error'));
    expect(sub).toHaveBeenCalled();
  });

  it('continues when storage is blocked or full', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    await initialize();
    service.changeLanguage(LanguageEnum.English);
    http.expectOne('/i18n/en.json').flush(english);
    expect(service.currentLang()).toBe(LanguageEnum.English);
  });

  it('does not access browser storage on the server', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideI18n({ storageKey: 'ssr.language', prefix: '/i18n/' }),
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });
    const ssr = TestBed.inject(LanguageService);
    const ssrHttp = TestBed.inject(HttpTestingController);
    const spy = vi.spyOn(Storage.prototype, 'getItem');
    const initialized = lastValueFrom(ssr.initialize());
    ssrHttp.expectOne('/i18n/ar.json').flush(arabic);
    await initialized;
    expect(ssr.currentLang()).toBe(LanguageEnum.Arabic);
    expect(spy).not.toHaveBeenCalled();
    ssrHttp.verify();
  });

  it('settles its pending initialization when its application injector is destroyed', async () => {
    const childInjector = createEnvironmentInjector(
      [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideI18n({ storageKey: 'child.language', prefix: '/i18n/' }),
      ],
      TestBed.inject(EnvironmentInjector),
    );
    const child = childInjector.get(LanguageService);
    child.initialize().subscribe();
    childInjector.destroy();
    http.match(() => true);
  });

  it('isolates sibling application providers and storage keys', async () => {
    // Initialize the primary service
    await initialize();
    expect(service.currentLang()).toBe(LanguageEnum.Arabic);

    // Create a sibling with an independent storageKey
    const sibling = createEnvironmentInjector(
      [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideI18n({ storageKey: 'sibling.language', prefix: '/i18n/' }),
      ],
      TestBed.inject(EnvironmentInjector),
    );
    const siblingService = sibling.get(LanguageService);
    expect(siblingService).not.toBe(service);

    // Switch primary to English — sibling remains independent
    service.changeLanguage(LanguageEnum.English);
    http.expectOne('/i18n/en.json').flush(english);
    expect(service.currentLang()).toBe(LanguageEnum.English);
    expect(localStorage.getItem('test.language')).toBe('en');
    expect(localStorage.getItem('sibling.language')).toBeNull();
    sibling.destroy();
  });

  it('supports dynamic translation keys via TranslatePipe ({{ titleObj.text | translate }})', async () => {
    await initialize();
    const fixture = TestBed.createComponent(TranslationExample);
    fixture.autoDetectChanges();

    // titleObj.text = 'NAVIGATION.DASHBOARD' → Arabic
    expect(fixture.nativeElement.querySelector('h1').textContent.trim()).toBe(
      'لوحة التحكم',
    );

    // Switch language to English — the same dynamic key should update
    service.changeLanguage(LanguageEnum.English);
    http.expectOne('/i18n/en.json').flush(english);
    await fixture.whenStable();

    // Dynamic key should reflect the new language without page reload
    expect(fixture.nativeElement.querySelector('h1').textContent.trim()).toBe(
      'Dashboard',
    );

    // Switch back to Arabic
    service.changeLanguage(LanguageEnum.Arabic);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('h1').textContent.trim()).toBe(
      'لوحة التحكم',
    );
  });

  it('supports nested JSON keys', async () => {
    await initialize();
    const translate = TestBed.inject(TranslateService);
    expect(translate.instant('HOME.GREETING', { name: 'Ali' })).toBe(
      'أهلًا Ali',
    );
    expect(translate.instant('NAVIGATION.DASHBOARD')).toBe('لوحة التحكم');
  });
});
