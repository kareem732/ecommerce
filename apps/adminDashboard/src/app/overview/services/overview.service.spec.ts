import { HttpContext, HttpContextToken, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import OverviewEndPoint from '../enums/end-points';
import { OverviewResponse } from '../interfaces/overview.res';
import { OVERVIEW_RESPONSE } from '../testing/overview.fixture';
import { OverviewService } from './overview.service';

describe('OverviewService', () => {
  let service: OverviewService;
  let http: HttpTestingController;

  const expectRequest = () =>
    http.expectOne((req) => req.url === OverviewEndPoint.STATISTICS);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OverviewService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends a GET request to the statistics endpoint', () => {
    service.getStatistics().subscribe();

    const req = expectRequest();
    expect(req.request.method).toBe('GET');
    req.flush(OVERVIEW_RESPONSE);
  });

  it('returns the response body', () => {
    let result: OverviewResponse | undefined;
    service.getStatistics().subscribe((response) => (result = response));

    expectRequest().flush(OVERVIEW_RESPONSE);

    expect(result).toEqual(OVERVIEW_RESPONSE);
  });

  it('sends the query values as params', () => {
    service
      .getStatistics({ revenuePeriod: 'week', topProductsLimit: 5, lowStockThreshold: 10 })
      .subscribe();

    const req = expectRequest();
    expect(req.request.params.get('revenuePeriod')).toBe('week');
    expect(req.request.params.get('topProductsLimit')).toBe('5');
    expect(req.request.params.get('lowStockThreshold')).toBe('10');
    req.flush(OVERVIEW_RESPONSE);
  });

  it('skips undefined query values', () => {
    service.getStatistics({ revenuePeriod: 'monthly', lowStockLimit: undefined }).subscribe();

    const req = expectRequest();
    expect(req.request.params.has('lowStockLimit')).toBe(false);
    expect(req.request.params.get('revenuePeriod')).toBe('monthly');
    req.flush(OVERVIEW_RESPONSE);
  });

  it('forwards the http context', () => {
    const token = new HttpContextToken<boolean>(() => false);
    service.getStatistics({}, new HttpContext().set(token, true)).subscribe();

    const req = expectRequest();
    expect(req.request.context.get(token)).toBe(true);
    req.flush(OVERVIEW_RESPONSE);
  });

  it('propagates http errors', () => {
    let failed = false;
    service.getStatistics().subscribe({ error: () => (failed = true) });

    expectRequest().flush('fail', { status: 500, statusText: 'Server Error' });

    expect(failed).toBe(true);
  });
});
