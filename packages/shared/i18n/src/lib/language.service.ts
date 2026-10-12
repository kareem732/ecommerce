import { isPlatformBrowser } from '@angular/common';
import {
  DOCUMENT,
  DestroyRef,
  ErrorHandler,
  Injectable,
  PLATFORM_ID,
  RendererFactory2,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import {
  Observable,
  catchError,
  defer,
  finalize,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { I18N_CONFIG, Language, isLanguage } from './i18n.config';
import { DirectionEnum, LanguageEnum } from './language.enums';

@Injectable()
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly config = inject(I18N_CONFIG);
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly errors = inject(ErrorHandler);
  private readonly destroyRef = inject(DestroyRef);
  private readonly renderer = inject(RendererFactory2).createRenderer(
    null,
    null,
  );
  private readonly currentLangSignal = signal<Language>(LanguageEnum.Arabic);
  private readonly failure = signal<unknown | null>(null);
  private initialization?: Observable<void>;
  private request = 0;
  private pending?: { language: Language; result: Observable<void> };

  readonly currentLang = this.currentLangSignal.asReadonly();
  readonly isRTL = computed(() => this.currentLang() === LanguageEnum.Arabic);
  readonly direction = computed(() =>
    this.isRTL() ? DirectionEnum.rtl : DirectionEnum.ltr,
  );
  readonly loading = this.translate.isLoading;
  readonly loadError = this.failure.asReadonly();

  initialize(): Observable<void> {
    this.initialization ??= defer(() => {
      const saved = this.readPreference();
      return this.translate.setFallbackLang(LanguageEnum.Arabic).pipe(
        switchMap(() => this.translate.use(LanguageEnum.Arabic)),
        tap(() => {
          this.currentLangSignal.set(LanguageEnum.Arabic);
          this.failure.set(null);
        }),
        switchMap(() =>
          saved === LanguageEnum.English ? this.switchTo(saved) : of(undefined),
        ),
      );
    }).pipe(
      tap({ error: (error: unknown) => this.failure.set(error) }),
      takeUntilDestroyed(this.destroyRef),
      // Keep initialization alive if a router subscriber leaves after the first
      // emission. Destruction still tears it down; failed loads remain retryable.
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    // A cached federated route must reapply its own document direction.
    return this.initialization.pipe(tap(() => this.updateDocument()));
  }

  changeLanguage(language: Language): void {
    if (!isLanguage(language) || this.destroyRef.destroyed) return;
    this.initialize()
      .pipe(
        switchMap(() => this.switchTo(language)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({ error: (error: unknown) => this.errors.handleError(error) });
  }

  private switchTo(language: Language): Observable<void> {
    if (this.pending?.language === language) return this.pending.result;
    if (!this.pending && this.currentLang() === language) return of(undefined);
    const request = ++this.request;
    this.failure.set(null);
    const result = defer(() => this.translate.use(language)).pipe(
      tap(() => {
        if (request !== this.request || this.destroyRef.destroyed) return;
        this.currentLangSignal.set(language);
        this.updateDocument();
        this.savePreference(language);
      }),
      map(() => undefined),
      catchError((error: unknown) => {
        if (request === this.request && !this.destroyRef.destroyed) {
          this.failure.set(error);
          this.errors.handleError(error);
        }
        return of(undefined);
      }),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        if (request === this.request) this.pending = undefined;
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    this.pending = { language, result };
    return result;
  }

  private updateDocument(): void {
    const htmlElement = this.document.documentElement;
    this.renderer.setAttribute(htmlElement, 'lang', this.currentLang());
    this.renderer.setAttribute(htmlElement, 'dir', this.direction());
  }

  private readPreference(): Language {
    if (!this.browser) return LanguageEnum.Arabic;
    try {
      const value = this.document.defaultView?.localStorage.getItem(
        this.config.storageKey,
      );
      return isLanguage(value) ? value : LanguageEnum.Arabic;
    } catch (error: unknown) {
      console.warn(
        'Language preference could not be read; using Arabic.',
        error,
      );
      return LanguageEnum.Arabic;
    }
  }

  private savePreference(language: Language): void {
    if (!this.browser) return;
    try {
      this.document.defaultView?.localStorage.setItem(
        this.config.storageKey,
        language,
      );
    } catch (error: unknown) {
      console.warn(
        'Language changed, but the preference could not be saved.',
        error,
      );
    }
  }
}
