import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PaginationChange } from '../../../../shared/ui/shared-pagination/shared-pagination';
import { Observable, Subject, of, throwError } from 'rxjs';
import { provideTranslateTesting, useEnglish } from '../../../../shared/utils/testing/translate.testing';
import { makeProduct, makeProductsResponse } from '../../../../shared/utils/testing/product.fixtures';
import { ProductsQuery } from '../../interfaces/home.model/home-model-request';
import { ProductsResponse } from '../../interfaces/home.model/home-model-response';
import { ShopService } from '../../services/shop.service';
import { Products } from './products';

describe('Products', () => {
  let fixture: ComponentFixture<Products>;
  let element: HTMLElement;
  let queries: ProductsQuery[];
  let response: (query: ProductsQuery) => Observable<ProductsResponse>;

  const setup = async () => {
    await TestBed.configureTestingModule({
      imports: [Products],
      providers: [
        provideRouter([]),
        provideTranslateTesting(),
        {
          provide: ShopService,
          useValue: {
            getProducts: (query: ProductsQuery) => {
              queries.push(query);
              return response(query);
            },
          },
        },
      ],
    }).compileComponents();
    useEnglish();
    fixture = TestBed.createComponent(Products);
    element = fixture.nativeElement;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(() => {
    queries = [];
    response = ({ page = 1, limit = 12 }) =>
      of({
        ...makeProductsResponse([makeProduct({ id: `p${page}` })]),
        payload: {
          ...makeProductsResponse([makeProduct({ id: `p${page}` })]).payload,
          metadata: { page, limit, total: 30, totalPages: 3 },
        },
      });
  });

  it('loads the first server page and renders each product with ProductCard', async () => {
    await setup();

    expect(queries).toEqual([{ page: 1, limit: 12 }]);
    expect(element.querySelectorAll('app-product-card')).toHaveLength(1);
  });

  it('converts PrimeNG page indexes to one-based API pages', async () => {
    await setup();

    (fixture.componentInstance as unknown as { onPageChange: (event: PaginationChange) => void })
      .onPageChange({ page: 1, rows: 12 });
    fixture.detectChanges();

    expect(queries[1]).toEqual({ page: 2, limit: 12 });
  });

  it('does not send duplicate page requests', async () => {
    await setup();

    (fixture.componentInstance as unknown as { onPageChange: (event: PaginationChange) => void })
      .onPageChange({ page: 0, rows: 12 });

    expect(queries).toHaveLength(1);
  });

  it('shows an empty state without creating placeholder cards', async () => {
    response = () => of(makeProductsResponse([]));
    await setup();

    expect(element.textContent).toContain('No products found.');
    expect(element.querySelector('app-product-card')).toBeNull();
  });

  it('cancels a superseded page request', async () => {
    const pending = new Subject<ProductsResponse>();
    response = ({ page = 1 }) => (page === 2 ? pending : of(makeProductsResponse([])));
    await setup();

    const change = (page: number) =>
      (fixture.componentInstance as unknown as { onPageChange: (event: PaginationChange) => void })
        .onPageChange({ page, rows: 12 });
    change(1);
    change(2);
    pending.next(makeProductsResponse([makeProduct({ id: 'stale' })]));

    expect(element.querySelector('app-product-card')).toBeNull();
  });

  it('keeps the last successful page when a later request fails', async () => {
    response = ({ page = 1 }) =>
      page === 1
        ? of(makeProductsResponse([makeProduct({ id: 'loaded' })]))
        : throwError(() => new Error('offline'));
    await setup();

    (fixture.componentInstance as unknown as { onPageChange: (event: PaginationChange) => void })
      .onPageChange({ page: 1, rows: 12 });
    fixture.detectChanges();

    expect(element.querySelectorAll('app-product-card')).toHaveLength(1);
    expect(element.textContent).not.toContain('No products found.');
  });
});
