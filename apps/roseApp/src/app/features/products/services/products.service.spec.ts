import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { environment } from '../../../../environments/environment';
import {
  makeProduct,
  makeProductsResponse,
} from '../../../shared/utils/testing/product.fixtures';
import {
  ProductResponse,
  ProductsResponse,
} from '../../shop/interfaces/home.model/home-model-response';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let http: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ProductsService,
      ],
    });
    service = TestBed.inject(ProductsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  describe('getProducts', () => {
    it('sends a GET request to /api/products without params when query is empty', () => {
      service.getProducts().subscribe();

      const req = http.expectOne(`${baseUrl}/api/products`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys()).toEqual([]);
      req.flush(makeProductsResponse([]));
    });

    it('returns the products response body', () => {
      const mockResponse = makeProductsResponse([makeProduct({ id: 'p-1' })]);
      let result: ProductsResponse | undefined;

      service.getProducts().subscribe((res) => (result = res));

      const req = http.expectOne(`${baseUrl}/api/products`);
      req.flush(mockResponse);

      expect(result).toEqual(mockResponse);
    });

    it('serializes query parameters and excludes empty, null, or undefined values', () => {
      service
        .getProducts({
          page: 2,
          limit: 12,
          search: '',
          categoryId: undefined,
        })
        .subscribe();

      const req = http.expectOne(
        (r) =>
          r.url === `${baseUrl}/api/products` &&
          r.params.get('page') === '2' &&
          r.params.get('limit') === '12' &&
          !r.params.has('search') &&
          !r.params.has('categoryId'),
      );
      expect(req.request.method).toBe('GET');
      req.flush(makeProductsResponse([]));
    });
  });

  describe('getProduct', () => {
    it('sends a GET request to /api/products/:id with the product id', () => {
      const productId = 'prod-abc-123';
      service.getProduct(productId).subscribe();

      const req = http.expectOne(`${baseUrl}/api/products/${productId}`);
      expect(req.request.method).toBe('GET');
      req.flush({
        status: true,
        code: 200,
        payload: { product: makeProduct({ id: productId }) },
      });
    });

    it('returns the single product response body', () => {
      const productId = 'prod-999';
      const mockProduct = makeProduct({ id: productId, title: 'Luxury Roses' });
      const mockResponse: ProductResponse = {
        status: true,
        code: 200,
        payload: { product: mockProduct },
      };
      let result: ProductResponse | undefined;

      service.getProduct(productId).subscribe((res) => (result = res));

      const req = http.expectOne(`${baseUrl}/api/products/${productId}`);
      req.flush(mockResponse);

      expect(result).toEqual(mockResponse);
    });

    it('propagates error when product is not found', () => {
      const productId = 'non-existent';
      let errorStatus: number | undefined;

      service.getProduct(productId).subscribe({
        next: () => expect.unreachable('Should have failed'),
        error: (err) => {
          errorStatus = err.status;
        },
      });

      const req = http.expectOne(`${baseUrl}/api/products/${productId}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(errorStatus).toBe(404);
    });
  });
});
