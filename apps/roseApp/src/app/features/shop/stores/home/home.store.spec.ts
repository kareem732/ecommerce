import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { MOST_POPULAR_LIMIT } from '../../components/most-popular/most-popular.constants';
import { ProductSortBy, SortOrder } from '../../enums/product-sort';
import { ProductsQuery } from '../../interfaces/home.model/home-model-request';
import { OccasionsResponse, ProductsResponse } from '../../interfaces/home.model/home-model-response';
import { TestimonialsResponse } from '../../interfaces/home.Testimonial/Testimonial';
import { ShopService } from '../../services/shop.service';
import {makeOccasion, makeOccasionsResponse,makeProduct,makeProductsResponse} from '../../../../shared/utils/testing/product.fixtures';
import { HomeStore } from './home.store';
import { makeTestimonialsResponse, makeTestimonial } from '../../../../shared/utils/testing/testimonial.fixtures';

const offline = () => throwError(() => new Error('offline'));
const ids = (items: { id: string }[]) => items.map((item) => item.id);

describe('HomeStore', () => {
  let queries: ProductsQuery[];
  let productsResult: (query: ProductsQuery) => Observable<ProductsResponse>;
  let occasionsResult: () => Observable<OccasionsResponse>;
  let testimonialsResult: () => Observable<TestimonialsResponse>;

  const bestSellingQueries = () =>
    queries.filter((query) => query.sortBy === ProductSortBy.BEST_SELLING);
  const popularQueries = () =>
    queries.filter((query) => query.sortBy === ProductSortBy.MOST_POPULAR);

  const setup = () => {
    TestBed.configureTestingModule({
      providers: [
        HomeStore,
        {
          provide: ShopService,
          useValue: {
            getProducts: (query: ProductsQuery) => {
              queries.push(query);
              return productsResult(query);
            },
            getOccasions: () => occasionsResult(),
            getTestimonials: () => testimonialsResult(),
          },
        },
      ],
    });
    const store = TestBed.inject(HomeStore);
    TestBed.tick();
    return store;
  };

  beforeEach(() => {
    queries = [];
    productsResult = (query) =>
      of(
        makeProductsResponse([
          makeProduct({ id: query.sortBy === ProductSortBy.BEST_SELLING ? 'best' : 'popular' }),
        ]),
      );
    occasionsResult = () =>
      of(makeOccasionsResponse([makeOccasion({ id: 'wedding', title: 'Wedding' })]));
    testimonialsResult = () => of(makeTestimonialsResponse([makeTestimonial({ id: 't1' })]));
  });

  describe('on init', () => {
    it('loads the 10 best selling products', () => {
      const store = setup();

      expect(bestSellingQueries()).toEqual([
        { page: 1, limit: 10, sortBy: ProductSortBy.BEST_SELLING, sortOrder: SortOrder.DESC },
      ]);
      expect(ids(store.bestSelling())).toEqual(['best']);
    });

    it('loads the occasions and the testimonials', () => {
      const store = setup();

      expect(ids(store.occasions())).toEqual(['wedding']);
      expect(ids(store.testimonials())).toEqual(['t1']);
    });

    it('loads every most popular product, with no occasion selected', () => {
      const store = setup();

      expect(store.selectedOccasionId()).toBeNull();
      expect(popularQueries()).toEqual([
        {
          page: 1,
          limit: MOST_POPULAR_LIMIT,
          sortBy: ProductSortBy.MOST_POPULAR,
          sortOrder: SortOrder.DESC,
        },
      ]);
      expect(ids(store.popular())).toEqual(['popular']);
      expect(store.popularLoading()).toBe(false);
    });

    it('keeps popularLoading on until the popular request answers', () => {
      const pending = new Subject<ProductsResponse>();
      productsResult = (query) =>
        query.sortBy === ProductSortBy.MOST_POPULAR
          ? pending
          : of(makeProductsResponse([makeProduct({ id: 'best' })]));
      const store = setup();

      expect(store.popularLoading()).toBe(true);

      pending.next(makeProductsResponse([makeProduct({ id: 'popular' })]));
      expect(store.popularLoading()).toBe(false);
      expect(ids(store.popular())).toEqual(['popular']);
    });
  });

  describe('selectOccasion', () => {
    it('reloads the popular products of that occasion', () => {
      const store = setup();

      store.selectOccasion('wedding');
      TestBed.tick();

      expect(store.selectedOccasionId()).toBe('wedding');
      expect(popularQueries()).toHaveLength(2);
      expect(popularQueries()[1].occasionId).toBe('wedding');
    });

    it('drops the occasion filter when null is selected', () => {
      const store = setup();
      store.selectOccasion('wedding');
      TestBed.tick();

      store.selectOccasion(null);
      TestBed.tick();

      expect(popularQueries()).toHaveLength(3);
      expect(popularQueries()[2].occasionId).toBeUndefined();
    });

    it('does not reload best selling', () => {
      const store = setup();

      store.selectOccasion('wedding');
      TestBed.tick();

      expect(bestSellingQueries()).toHaveLength(1);
    });

    it('ignores a late response of the previous occasion', () => {
      const pending = new Map<string, Subject<ProductsResponse>>();
      productsResult = (query) => {
        if (query.sortBy !== ProductSortBy.MOST_POPULAR) {
          return of(makeProductsResponse([makeProduct({ id: 'best' })]));
        }
        const subject = new Subject<ProductsResponse>();
        pending.set(query.occasionId ?? 'all', subject);
        return subject;
      };
      const store = setup();

      store.selectOccasion('wedding');
      TestBed.tick();
      pending.get('all')?.next(makeProductsResponse([makeProduct({ id: 'stale' })]));
      pending.get('wedding')?.next(makeProductsResponse([makeProduct({ id: 'fresh' })]));

      expect(ids(store.popular())).toEqual(['fresh']);
      expect(store.popularLoading()).toBe(false);
    });
  });

  describe('errors', () => {
    it('falls back to empty lists when the products requests fail', () => {
      productsResult = offline;
      const store = setup();

      expect(store.bestSelling()).toEqual([]);
      expect(store.popular()).toEqual([]);
      expect(store.popularLoading()).toBe(false);
    });

    it('clears the popular products when changing the occasion fails', () => {
      productsResult = (query) =>
        query.occasionId
          ? offline()
          : of(
              makeProductsResponse([
                makeProduct({
                  id: query.sortBy === ProductSortBy.BEST_SELLING ? 'best' : 'popular',
                }),
              ]),
            );
      const store = setup();
      expect(ids(store.popular())).toEqual(['popular']);

      store.selectOccasion('wedding');
      TestBed.tick();

      expect(store.popular()).toEqual([]);
      expect(store.popularLoading()).toBe(false);
    });

    it('keeps the other sections when one request fails', () => {
      occasionsResult = offline;
      const store = setup();

      expect(store.occasions()).toEqual([]);
      expect(ids(store.bestSelling())).toEqual(['best']);
      expect(ids(store.testimonials())).toEqual(['t1']);
    });

    it('keeps the other sections when the testimonials request fails', () => {
      testimonialsResult = offline;
      const store = setup();

      expect(store.testimonials()).toEqual([]);
      expect(ids(store.occasions())).toEqual(['wedding']);
    });
  });
});
