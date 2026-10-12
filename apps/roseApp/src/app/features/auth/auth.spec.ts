import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ApplicationInitStatus } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { readFileSync } from 'node:fs';
import { LanguageService } from '@org/shared-i18n';
import { appConfig } from '../../app.config';
import { Auth } from './auth';

const english = JSON.parse(readFileSync('public/i18n/en.json', 'utf8'));
const arabic = JSON.parse(readFileSync('public/i18n/ar.json', 'utf8'));

describe('Auth with the RoseApp bootstrap providers', () => {
  let fixture: ComponentFixture<Auth>;
  let http: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Auth],
      providers: [...appConfig.providers, provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    const initialization = TestBed.inject(ApplicationInitStatus);
    http.expectOne('./i18n/ar.json').flush(arabic);
    await initialization.donePromise;
    fixture = TestBed.createComponent(Auth);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('creates the existing auth screen with Arabic as default and a translated language button', () => {
    expect(fixture.componentInstance).toBeTruthy();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('button')?.textContent).toContain('English');
    expect(element.querySelector('main')?.dir).toBe('rtl');
  });

  it('switches through the button to English, updates the pipe and persists only RoseApp preference', async () => {
    const element: HTMLElement = fixture.nativeElement;
    element.querySelector('button')?.click();
    await vi.waitFor(() => http.expectOne('./i18n/en.json').flush(english));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(TestBed.inject(LanguageService).currentLang()).toBe('en');
    expect(element.querySelector('button')?.textContent).toContain('العربية');
    expect(element.querySelector('main')?.dir).toBe('ltr');
    expect(localStorage.getItem('roseApp.language')).toBe('en');
    expect(localStorage.getItem('adminDashboard.language')).toBeNull();
  });
});
