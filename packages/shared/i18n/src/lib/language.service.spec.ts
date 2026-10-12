import { lastValueFrom } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  DOCUMENT,
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
    <span>{{ 'COMMON.FALLBACK' | translate }}</span>`,
})
class TranslationExample {}

const english = {
  HOME: { GREETING: 'Hello {{name}}' },
  COMMON: { FALLBACK: 'English fallback' },
};
const arabic = { HOME: { GREETING: 'مرحبًا {{name}}' } };

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
    http.expectOne('/i18n/en.json').flush(english);
    await initialized;
  }

  it('defers initialization until subscribed and shares the completed result', async () => {
    const initialization = service.initialize();
    http.expectNone('/i18n/en.json');
    const first = lastValueFrom(initialization);
    http.expectOne('/i18n/en.json').flush(english);
    await first;
    await lastValueFrom(initialization);
    http.expectNone('/i18n/en.json');
  });

  it('reports initialization errors from the void changeLanguage API and retries', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(service.changeLanguage('ar')).toBeUndefined();
    http
      .expectOne('/i18n/en.json')
      .flush('Missing', { status: 404, statusText: 'Not Found' });
    expect(handleError).toHaveBeenCalledOnce();
    expect(service.loadError()).not.toBeNull();
    service.changeLanguage('ar');
    http.expectOne('/i18n/en.json').flush(english);
    http.expectOne('/i18n/ar.json').flush(arabic);
    expect(service.currentLang()).toBe('ar');
    expect(service.loadError()).toBeNull();
  });

  it('defaults to English and initializes only once', async () => {
    const first = lastValueFrom(service.initialize());
    const second = lastValueFrom(service.initialize());
    http.expectOne('/i18n/en.json').flush(english);
    await Promise.all([first, second]);
    await lastValueFrom(service.initialize());
    expect(service.currentLang()).toBe('en');
    expect(service.direction()).toBe(DirectionEnum.ltr);
    expect(service.isRTL()).toBe(false);
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
    expect(TestBed.inject(TranslateService).getFallbackLang()).toBe('en');
    http.expectNone('/i18n/en.json');
  });

  it('restores Arabic after loading the English fallback', async () => {
    localStorage.setItem('test.language', 'ar');
    const initialized = lastValueFrom(service.initialize());
    http.expectOne('/i18n/en.json').flush(english);
    await vi.waitFor(() => http.expectOne('/i18n/ar.json').flush(arabic));
    await initialized;
    expect(service.currentLang()).toBe('ar');
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
  });

  it.each(['fr', '', 'AR', 'null'])(
    'ignores invalid saved language %s',
    async (value) => {
      localStorage.setItem('test.language', value);
      await initialize();
      expect(service.currentLang()).toBe('en');
    },
  );

  it('switches signals, HTML attributes, persistence and the real pipe with interpolation and fallback', async () => {
    await initialize();
    const fixture = TestBed.createComponent(TranslationExample);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Hello Sam');
    service.changeLanguage(LanguageEnum.Arabic);
    await vi.waitFor(() => http.expectOne('/i18n/ar.json').flush(arabic));
    expect(service.currentLang()).toBe('ar');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('مرحبًا Sam');
    expect(fixture.nativeElement.textContent).toContain('English fallback');
    expect(service.direction()).toBe(DirectionEnum.rtl);
    expect(service.isRTL()).toBe(true);
    expect(localStorage.getItem('test.language')).toBe('ar');
    service.changeLanguage('en');
    expect(document.documentElement.dir).toBe('ltr');
    expect(localStorage.getItem('test.language')).toBe('en');
    http.expectNone('/i18n/en.json');
  });

  it('coalesces concurrent same-language requests and caches loaded translations', async () => {
    await initialize();
    service.changeLanguage('ar');
    service.changeLanguage('ar');
    await vi.waitFor(() => http.expectOne('/i18n/ar.json').flush(arabic));
    expect(service.currentLang()).toBe('ar');
    service.changeLanguage('ar');
    service.changeLanguage('en');
    service.changeLanguage('ar');
    http.expectNone('/i18n/ar.json');
  });

  it('keeps the latest requested language when an earlier response arrives late', async () => {
    await initialize();
    service.changeLanguage('ar');
    await vi.waitFor(() => expect(service.loading()).toBe(true));
    service.changeLanguage('en');
    http.expectOne('/i18n/ar.json').flush(arabic);

    expect(service.currentLang()).toBe('en');
    expect(TestBed.inject(TranslateService).currentLang()).toBe('en');
    expect(localStorage.getItem('test.language')).toBe('en');
  });

  it('retains English on a failed switch and allows a retry', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await initialize();
    service.changeLanguage(LanguageEnum.Arabic);
    await vi.waitFor(() =>
      http
        .expectOne('/i18n/ar.json')
        .flush('Unavailable', { status: 503, statusText: 'Unavailable' }),
    );

    expect(service.currentLang()).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
    expect(localStorage.getItem('test.language')).toBeNull();
    expect(service.loadError()).not.toBeNull();
    expect(handleError).toHaveBeenCalledOnce();
    service.changeLanguage('ar');
    await vi.waitFor(() => http.expectOne('/i18n/ar.json').flush(arabic));
    expect(service.currentLang()).toBe('ar');
    expect(service.loadError()).toBeNull();
  });

  it('falls back to English when the saved Arabic resource fails', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    localStorage.setItem('test.language', 'ar');
    const initialized = lastValueFrom(service.initialize());
    http.expectOne('/i18n/en.json').flush(english);
    await vi.waitFor(() =>
      http
        .expectOne('/i18n/ar.json')
        .flush('Missing', { status: 404, statusText: 'Not Found' }),
    );
    await initialized;
    expect(service.currentLang()).toBe('en');
    expect(TestBed.inject(TranslateService).currentLang()).toBe('en');
    expect(handleError).toHaveBeenCalledOnce();
  });

  it('rejects initialization if English cannot load and permits retry', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const initialized = lastValueFrom(service.initialize());
    const rejected = expect(initialized).rejects.toMatchObject({ status: 404 });
    http
      .expectOne('/i18n/en.json')
      .flush('Missing', { status: 404, statusText: 'Not Found' });
    await rejected;
    expect(service.loadError()).not.toBeNull();
    await initialize();
    expect(service.loadError()).toBeNull();
  });

  it('continues when storage is blocked or full', async () => {
    const warning = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Denied');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Full');
    });
    await initialize();
    service.changeLanguage(LanguageEnum.Arabic);
    await vi.waitFor(() => http.expectOne('/i18n/ar.json').flush(arabic));
    expect(service.currentLang()).toBe('ar');
    expect(warning).toHaveBeenCalledTimes(2);
  });

  it('does not access browser storage on the server', async () => {
    TestBed.resetTestingModule();
    const storage = vi.spyOn(Storage.prototype, 'getItem');
    const serverDocument = document.implementation.createHTMLDocument();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideI18n({
          storageKey: 'server.language',
          prefix: 'https://example.test/i18n/',
        }),
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: DOCUMENT, useValue: serverDocument },
      ],
    });
    service = TestBed.inject(LanguageService);
    http = TestBed.inject(HttpTestingController);
    const initialized = lastValueFrom(service.initialize());
    http.expectOne('https://example.test/i18n/en.json').flush(english);
    await initialized;
    expect(storage).not.toHaveBeenCalled();
    expect(serverDocument.documentElement.lang).toBe('en');
  });

  it('settles its pending initialization when its application injector is destroyed', async () => {
    const app = createEnvironmentInjector(
      [
        provideI18n({
          storageKey: 'temporary.language',
          prefix: '/temporary/i18n/',
        }),
      ],
      TestBed.inject(EnvironmentInjector),
    );
    const initialized = lastValueFrom(app.get(LanguageService).initialize());
    const rejection = expect(initialized).rejects.toThrow();
    const request = http.expectOne('/temporary/i18n/en.json');
    app.destroy();
    await rejection;
    // ngx-translate owns its eager fallback subscription; let that finite request
    // finish. LanguageService must stop waiting and must not mutate the document.
    document.documentElement.lang = 'ar';
    request.flush(english);
    await Promise.resolve();
    expect(document.documentElement.lang).toBe('ar');
  });

  it('isolates sibling application providers, dictionaries and storage keys', async () => {
    await initialize();
    const other = createEnvironmentInjector(
      [provideI18n({ storageKey: 'other.language', prefix: '/other/i18n/' })],
      TestBed.inject(EnvironmentInjector),
    );
    try {
      const second = other.get(LanguageService);
      const initialized = lastValueFrom(second.initialize());
      http
        .expectOne('/other/i18n/en.json')
        .flush({ HOME: { GREETING: 'Other {{name}}' } });
      await initialized;
      service.changeLanguage(LanguageEnum.Arabic);
      await vi.waitFor(() => http.expectOne('/i18n/ar.json').flush(arabic));

      expect(second.currentLang()).toBe('en');
      expect(
        other.get(TranslateService).instant('HOME.GREETING', { name: 'Sam' }),
      ).toBe('Other Sam');
      expect(localStorage.getItem('other.language')).toBeNull();
      await lastValueFrom(second.initialize());
      expect(document.documentElement.dir).toBe('ltr');
    } finally {
      other.destroy();
    }
  });
});
