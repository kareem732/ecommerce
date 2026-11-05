import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { PaginationChange } from '../../../../shared/ui/shared-pagination/shared-pagination';
import { provideTranslateTesting, useEnglish } from '../../../../shared/utils/testing/translate.testing';
import {
  makeOccasion,
  makeOccasionsResponse,
  makeProduct,
  makeProductsResponse,
} from '../../../../shared/utils/testing/product.fixtures';
import { ProductsQuery } from '../../interfaces/home.model/home-model-request';
import {
  CategoriesResponse,
  Category,
  ProductsResponse,
} from '../../interfaces/home.model/home-model-response';
import { ShopService } from '../../services/shop.service';
import { EMPTY_PRODUCT_FILTERS, ProductFilters } from '../../utils/product-filters';
import { Products } from './products';

interface ProductsInternals {
  onPageChange(event: PaginationChange): void;
  onFiltersChange(filters: ProductFilters): void;
}

describe('Products', () => {
  let fixture: ComponentFixture<Products>;
  let element: HTMLElement;
  let queries: ProductsQuery[];
  let response: (query: ProductsQuery) => Observable<ProductsResponse>;
  let categoriesResponse: () => Observable<CategoriesResponse>;

  const page = () => fixture.componentInstance as unknown as ProductsInternals;
  const cards = () => element.querySelectorAll('app-product-card');

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
            getCategories: () => categoriesResponse(),
            getOccasions: () => of(makeOccasionsResponse([makeOccasion({ title: 'Wedding' })])),
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

  const catalog = (count: number) =>
    Array.from({ length: count }, (_, i) =>
      makeProduct({
        id: `p${i}`,
        categoryId: i % 2 ? 'cards' : 'flowers',
        category: i % 2 ? { id: 'cards', title: 'Cards' } : { id: 'flowers', title: 'Flowers' },
      }),
    );

  const makeCategory = (id: string, title: string): Category => ({
    id,
    title,
    description: null,
    image: null,
    immutable: false,
    createdAt: '',
    updatedAt: '',
    subCategories: [],
    _count: { products: 0 },
  });

  const categoriesOf = (categories: Category[]): CategoriesResponse => ({
    status: true,
    code: 200,
    payload: {
      data: categories,
      metadata: { page: 1, limit: 100, total: categories.length, totalPages: 1 },
    },
  });

  beforeEach(() => {
    queries = [];
    response = () => of(makeProductsResponse(catalog(15)));
    categoriesResponse = () =>
      of(categoriesOf([makeCategory('flowers', 'Flowers'), makeCategory('gifts', 'Gifts')]));
  });

  it('loads the catalog and shows the first 12 products', async () => {
    await setup();

    expect(queries).toHaveLength(1);
    expect(cards()).toHaveLength(12);
  });

  it('paginates in memory without new requests', async () => {
    await setup();

    page().onPageChange({ page: 1, rows: 12 });
    fixture.detectChanges();

    expect(queries).toHaveLength(1);
    expect(cards()).toHaveLength(3);
  });

  it('filters by category and goes back to the first page', async () => {
    await setup();
    page().onPageChange({ page: 1, rows: 12 });

    page().onFiltersChange({ ...EMPTY_PRODUCT_FILTERS, categoryId: 'cards' });
    fixture.detectChanges();

    expect(cards()).toHaveLength(7);
  });

  it('lists the categories and occasions from their APIs in the sidebar', async () => {
    await setup();
    const sidebar = element.querySelector('app-product-filters')?.textContent;

    expect(sidebar).toContain('Flowers');
    expect(sidebar).toContain('Gifts');
    expect(sidebar).not.toContain('Cards');
    expect(sidebar).toContain('Wedding');
  });

  it('still shows the products when the categories request fails', async () => {
    categoriesResponse = () => throwError(() => new Error('offline'));
    await setup();

    expect(cards()).toHaveLength(12);
  });

  it('shows a no-match message when filters exclude everything', async () => {
    await setup();

    page().onFiltersChange({ ...EMPTY_PRODUCT_FILTERS, minPrice: 1_000_000 });
    fixture.detectChanges();

    expect(cards()).toHaveLength(0);
    expect(element.textContent).toContain('No products match these filters.');
  });

  it('shows an empty state when the catalog is empty', async () => {
    response = () => of(makeProductsResponse([]));
    await setup();

    expect(element.textContent).toContain('No products found.');
    expect(cards()).toHaveLength(0);
  });

  it('shows the empty state when loading fails', async () => {
    response = () => throwError(() => new Error('offline'));
    await setup();

    expect(element.textContent).toContain('No products found.');
  });
});
