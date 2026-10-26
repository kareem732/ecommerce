import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LoadingService } from '../services/loading.service';
import {
  loadingInterceptor,
  skipLoading,
} from './loading.interceptor';

describe('loadingInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let loadingService: LoadingService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        LoadingService,
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoadingService);
    loadingService.reset();
  });

  afterEach(() => {
    controller.verify();
    loadingService.reset();
    TestBed.resetTestingModule();
  });

  it('activates loading when an eligible request starts', () => {
    expect(loadingService.isLoading()).toBe(false);

    http.get('/api/test').subscribe();

    expect(loadingService.isLoading()).toBe(true);
    expect(loadingService.count()).toBe(1);

    const req = controller.expectOne('/api/test');
    req.flush({});
  });

  it('deactivates loading after a successful response', () => {
    let result: unknown;
    http.get('/api/test').subscribe((res) => (result = res));

    expect(loadingService.isLoading()).toBe(true);

    const req = controller.expectOne('/api/test');
    req.flush({ success: true });

    expect(result).toEqual({ success: true });
    expect(loadingService.isLoading()).toBe(false);
    expect(loadingService.count()).toBe(0);
  });

  it('deactivates loading after an HTTP error occurs and propagates the error', () => {
    let errorStatus: number | undefined;
    http.get('/api/error').subscribe({
      next: () => expect.unreachable('Should have failed'),
      error: (err) => {
        errorStatus = err.status;
      },
    });

    expect(loadingService.isLoading()).toBe(true);

    const req = controller.expectOne('/api/error');
    req.flush('Bad request', { status: 400, statusText: 'Bad Request' });

    expect(errorStatus).toBe(400);
    expect(loadingService.isLoading()).toBe(false);
    expect(loadingService.count()).toBe(0);
  });

  it('deactivates loading after cancellation or observable unsubscription', () => {
    const sub = http.get('/api/cancel').subscribe();

    expect(loadingService.isLoading()).toBe(true);
    expect(loadingService.count()).toBe(1);

    // Cancel request before response arrives
    sub.unsubscribe();

    const req = controller.expectOne('/api/cancel');
    expect(req.cancelled).toBe(true);

    expect(loadingService.isLoading()).toBe(false);
    expect(loadingService.count()).toBe(0);
  });

  it('correctly tracks concurrent requests until all complete', () => {
    http.get('/api/one').subscribe();
    http.get('/api/two').subscribe();

    expect(loadingService.isLoading()).toBe(true);
    expect(loadingService.count()).toBe(2);

    const req1 = controller.expectOne('/api/one');
    const req2 = controller.expectOne('/api/two');

    // First request finishes, second still pending
    req1.flush({ id: 1 });
    expect(loadingService.isLoading()).toBe(true);
    expect(loadingService.count()).toBe(1);

    // Second request finishes
    req2.flush({ id: 2 });
    expect(loadingService.isLoading()).toBe(false);
    expect(loadingService.count()).toBe(0);
  });

  it('does not activate loading for requests excluded via skipLoading', () => {
    http.get('/api/polling', { context: skipLoading() }).subscribe();

    expect(loadingService.isLoading()).toBe(false);
    expect(loadingService.count()).toBe(0);

    const req = controller.expectOne('/api/polling');
    req.flush({});

    expect(loadingService.isLoading()).toBe(false);
    expect(loadingService.count()).toBe(0);
  });
});
