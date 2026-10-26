import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { FooterService, SubscriptionRequest, SubscriptionResponse } from './footer.service';

describe('FooterService', () => {
  let service: FooterService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(FooterService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('creates the service', () => {
    expect(service).toBeTruthy();
  });

  it('sends a POST request to /api/subscriptions with default payload { email: "customer@example.com" }', () => {
    const mockResponse: SubscriptionResponse = { message: 'Subscribed successfully' };
    let actualResponse: SubscriptionResponse | undefined;

    service.subscriptionEmail().subscribe((res) => {
      actualResponse = res;
    });

    const req = http.expectOne(`${environment.apiUrl}/api/subscriptions`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'customer@example.com' });

    req.flush(mockResponse);
    expect(actualResponse).toEqual(mockResponse);
  });

  it('sends a POST request with custom payload when provided', () => {
    const payload: SubscriptionRequest = { email: 'custom@example.com' };
    service.subscriptionEmail(payload).subscribe();

    const req = http.expectOne(`${environment.apiUrl}/api/subscriptions`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush({ message: 'Success' });
  });

  it('propagates http errors when the request fails', () => {
    let errorStatus: number | undefined;

    service.subscriptionEmail().subscribe({
      error: (err: { status: number }) => {
        errorStatus = err.status;
      },
    });

    const req = http.expectOne(`${environment.apiUrl}/api/subscriptions`);
    req.flush('Subscription failed', { status: 500, statusText: 'Server Error' });

    expect(errorStatus).toBe(500);
  });
});
