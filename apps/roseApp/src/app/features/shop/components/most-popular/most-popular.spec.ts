import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProductSortBy, SortOrder } from '../../enums/product-sort';
import { ProductsQuery } from '../../interfaces/home.model/home-model-request';
import { Product } from '../../interfaces/home.model/home-model-response';
import { ShopService } from '../../services/shop.service';
import {
  makeOccasion,
  makeOccasionsResponse,
  makeProduct,
  makeProductsResponse,
} from '../../../../shared/utils/testing/product.fixtures';
import { MostPopular } from './most-popular';

describe('MostPopular', () => {
  const occasions = [
    makeOccasion({ id: 'w', title: 'Wedding' }),
    makeOccasion({ id: 'a', title: 'Anniversary' }),
  ];

  let fixture: ComponentFixture<MostPopular>;
  let element: HTMLElement;
  let queries: ProductsQuery[];
  let productsResult: Product[];

  const filterButtons = () =>
    element.querySelectorAll<HTMLButtonElement>('.filter__item');

  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const setup = async () => {
    await TestBed.configureTestingModule({
      imports: [MostPopular],
      providers: [
        {
          provide: ShopService,
          useValue: {
            getOccasions: () => of(makeOccasionsResponse(occasions)),
            getProducts: (query?: ProductsQuery) => {
              queries.push(query ?? {});
              return of(makeProductsResponse(productsResult));
            },
          },
        },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MostPopular);
    element = fixture.nativeElement;
    await settle();
  };

  beforeEach(() => {
    queries = [];
    productsResult = [
      makeProduct({ id: 'p1', title: 'First Bouquet' }),
      makeProduct({ id: 'p2', title: 'Second Bouquet' }),
    ];
  });

  it('renders the section title', async () => {
    await setup();

    expect(element.querySelector('app-section-title')?.textContent?.trim()).toBe(
      'Most Popular',
    );
  });

  it('requests all the most popular products by default', async () => {
    await setup();

    expect(queries).toEqual([
      {
        page: 1,
        limit: 12,
        sortBy: ProductSortBy.MOST_POPULAR,
        sortOrder: SortOrder.DESC,
      },
    ]);
    expect(queries[0].occasionId).toBeUndefined();
  });

  it('renders All followed by the occasions, with All active', async () => {
    await setup();

    const labels = Array.from(filterButtons()).map((b) => b.textContent?.trim());
    expect(labels).toEqual(['All', 'Wedding', 'Anniversary']);
    expect(element.querySelector('.filter__item--active')?.textContent?.trim()).toBe('All');
  });

  it('renders a product card for every product', async () => {
    await setup();

    expect(element.querySelectorAll('app-product-card')).toHaveLength(2);
  });

  it('requests the products of the selected occasion by its id', async () => {
    await setup();

    filterButtons()[2].click();
    await settle();

    expect(queries).toHaveLength(2);
    expect(queries[1].occasionId).toBe('a');
  });

  it('marks the clicked occasion as active', async () => {
    await setup();

    filterButtons()[1].click();
    await settle();

    expect(element.querySelector('.filter__item--active')?.textContent?.trim()).toBe(
      'Wedding',
    );
  });

  it('drops the occasion filter when All is selected again', async () => {
    await setup();

    filterButtons()[1].click();
    await settle();
    filterButtons()[0].click();
    await settle();

    expect(queries).toHaveLength(3);
    expect(queries[2].occasionId).toBeUndefined();
  });

  it('shows an empty message when there are no products', async () => {
    productsResult = [];
    await setup();

    expect(element.querySelector('.most-popular__empty')).toBeTruthy();
    expect(element.querySelector('app-product-card')).toBeNull();
  });

  it('links View More to the products page', async () => {
    await setup();

    const link = element.querySelector('.most-popular__more') as HTMLAnchorElement;

    expect(link.textContent).toContain('View More');
    expect(link.getAttribute('href')).toBe('/shop/products');
  });
});
