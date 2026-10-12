import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { readFileSync } from 'node:fs';
import { appConfig } from '../app.config';
import { RemoteEntry } from './entry';

const english = JSON.parse(readFileSync('public/i18n/en.json', 'utf8'));
const arabic = JSON.parse(readFileSync('public/i18n/ar.json', 'utf8'));

describe('Dashboard bootstrap integration', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
  });

  it('defaults to Arabic and switches to English through the void API', async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [RemoteEntry],
      providers: [...appConfig.providers, provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpTestingController);
    const initialization = TestBed.inject(ApplicationInitStatus);
    http.expectOne('./i18n/ar.json').flush(arabic);
    await initialization.donePromise;

    const fixture = TestBed.createComponent(RemoteEntry);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('h1')?.textContent).toContain(
      'أهلًا بك في adminDashboard 👋',
    );

    element.querySelector('button')?.click();
    await vi.waitFor(() => http.expectOne('./i18n/en.json').flush(english));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('h1')?.textContent).toContain(
      'Welcome adminDashboard 👋',
    );
    expect(document.documentElement.dir).toBe('ltr');
    expect(localStorage.getItem('adminDashboard.language')).toBe('en');
  });
});
