import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import ShopEndPoint from '../enums/EndPoints';
import { ProductSortBy, SortOrder } from '../enums/product-sort';
import {
  OccasionsResponse,
  ProductsResponse,
} from '../interfaces/home.model/home-model-response';
import {
  makeOccasion,
  makeOccasionsResponse,
  makeProduct,
  makeProductsResponse,
} from '../../../shared/utils/testing/product.fixtures';
import { ShopService } from './shop.service';

describe('ShopService', () => {
  let service: ShopService;
  let http: HttpTestingController;

  const expectProductsRequest = () =>
    http.expectOne((req) => req.url === ShopEndPoint.PRODUCTS);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ShopService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('getProducts', () => {
    it('sends a GET request to the products endpoint', () => {
      service.getProducts().subscribe();

      const req = expectProductsRequest();
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys()).toEqual([]);
      req.flush(makeProductsResponse([]));
    });

    it('returns the response body', () => {
      const response = makeProductsResponse([makeProduct()]);
      let result: ProductsResponse | undefined;

      service.getProducts().subscribe((res) => (result = res));
      expectProductsRequest().flush(response);

      expect(result).toEqual(response);
    });

    it('serializes the query as url params', () => {
      service
        .getProducts({
          page: 1,
          limit: 10,
          sortBy: ProductSortBy.BEST_SELLING,
          sortOrder: SortOrder.DESC,
        })
        .subscribe();

      const { params } = expectProductsRequest().request;
      expect(params.get('page')).toBe('1');
      expect(params.get('limit')).toBe('10');
      expect(params.get('sortBy')).toBe('bestSelling');
      expect(params.get('sortOrder')).toBe('desc');
    });

    it('skips undefined and empty values', () => {
      service.getProducts({ search: '', categoryId: undefined, page: 2 }).subscribe();

      const { params } = expectProductsRequest().request;
      expect(params.has('search')).toBe(false);
      expect(params.has('categoryId')).toBe(false);
      expect(params.get('page')).toBe('2');
    });

    it('keeps zero as a valid value', () => {
      service.getProducts({ minPrice: 0 }).subscribe();

      expect(expectProductsRequest().request.params.get('minPrice')).toBe('0');
    });

    it('propagates http errors to the subscriber', () => {
      let status: number | undefined;

      service
        .getProducts()
        .subscribe({ error: (err: { status: number }) => (status = err.status) });
      expectProductsRequest().flush('error', { status: 500, statusText: 'Server Error' });

      expect(status).toBe(500);
    });
  });

  describe('getOccasions', () => {
    it('sends a GET request to the occasions endpoint', () => {
      service.getOccasions().subscribe();

      const req = http.expectOne(ShopEndPoint.OCCASIONS);
      expect(req.request.method).toBe('GET');
      req.flush(makeOccasionsResponse([]));
    });

    it('returns the occasions response body', () => {
      const response = makeOccasionsResponse([makeOccasion()]);
      let result: OccasionsResponse | undefined;

      service.getOccasions().subscribe((res) => (result = res));
      http.expectOne(ShopEndPoint.OCCASIONS).flush(response);

      expect(result).toEqual(response);
    });
  });
});
