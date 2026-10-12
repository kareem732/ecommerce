import { HttpBackend, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { readFileSync } from 'node:fs';
import { remoteRoutes } from './entry.routes';

describe('adminDashboard federated routes', () => {
  it('waits for its isolated Observable initializer before rendering', async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(remoteRoutes),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const backend = TestBed.inject(HttpBackend);
    TestBed.inject(Router).resetConfig(
      remoteRoutes.map((route) => ({
        ...route,
        providers: [
          ...(route.providers ?? []),
          { provide: HttpBackend, useValue: backend },
        ],
      })),
    );

    const navigation = RouterTestingHarness.create('/');
    await vi.waitFor(() =>
      http
        .expectOne('./i18n/ar.json')
        .flush(JSON.parse(readFileSync('public/i18n/ar.json', 'utf8'))),
    );
    const harness = await navigation;
    expect(harness.routeNativeElement?.textContent).toContain(
      'أهلًا بك في adminDashboard',
    );
    expect(document.documentElement.lang).toBe('ar');
    http.verify();
  });
});
