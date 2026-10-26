import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { REVIEWS_PAGE_SIZE } from '../../components/product-reviews/product-reviews.constants';
import { ProductResponse } from '../../interfaces/home.model/home-model-response';
import { ReviewsQuery } from '../../interfaces/review.model/review-request';
import { ReviewsResponse } from '../../interfaces/review.model/review-response';
import { ShopService } from '../../services/shop.service';
import { makeProduct } from '../../../../shared/utils/testing/product.fixtures';
import { makeReview, makeReviewsResponse } from '../../../../shared/utils/testing/review.fixtures';
import { ReviewsStore } from './reviews.store';

const TOTAL = 12;

const reviewsPage = (page: number, total = TOTAL, id = `review-${page}`): ReviewsResponse =>
  makeReviewsResponse([makeReview({ id })], { page, total });

const productResponse = (rating: number, ratings: number): ProductResponse => ({
  status: true,
  code: 200,
  payload: { product: makeProduct({ rating, ratings }) },
});

const offline = () => throwError(() => new Error('offline'));

describe('ReviewsStore', () => {
  let queries: ReviewsQuery[];
  let productIds: string[];
  let reviewsResult: (query: ReviewsQuery) => Observable<ReviewsResponse>;
  let productResult: (id: string) => Observable<ProductResponse>;

  const setup = () => {
    TestBed.configureTestingModule({
      providers: [
        ReviewsStore,
        {
          provide: ShopService,
          useValue: {
            getReviews: (query: ReviewsQuery) => {
              queries.push(query);
              return reviewsResult(query);
            },
            getProduct: (id: string) => {
              productIds.push(id);
              return productResult(id);
            },
          },
        },
      ],
    });
    return TestBed.inject(ReviewsStore);
  };

  const reviewIds = (store: InstanceType<typeof ReviewsStore>) =>
    store.reviews().map((review) => review.id);
  const pages = () => queries.map((query) => query.page);

  beforeEach(() => {
    queries = [];
    productIds = [];
    reviewsResult = ({ page = 1 }) => of(reviewsPage(page));
    productResult = () => of(productResponse(4.5, 8));
  });

  it('starts loading with no reviews, before any product is set', () => {
    const store = setup();

    expect(store.status()).toBe('loading');
    expect(store.firstLoad()).toBe(true);
    expect(store.reviews()).toEqual([]);
    expect(store.summary()).toBeNull();
    expect(queries).toEqual([]);
  });

  describe('loadProduct', () => {
    it('loads the first page and the rating summary', () => {
      const store = setup();

      store.loadProduct('product-1');

      expect(queries).toEqual([{ productId: 'product-1', page: 1, limit: REVIEWS_PAGE_SIZE }]);
      expect(productIds).toEqual(['product-1']);
      expect(reviewIds(store)).toEqual(['review-1']);
      expect(store.total()).toBe(TOTAL);
      expect(store.status()).toBe('loaded');
      expect(store.firstLoad()).toBe(false);
      expect(store.hasMore()).toBe(true);
      expect(store.summary()).toEqual({ rating: 4.5, count: 8 });
    });

    it('stays in the first load state until the response arrives', () => {
      const pending = new Subject<ReviewsResponse>();
      reviewsResult = () => pending;
      const store = setup();

      store.loadProduct('product-1');
      expect(store.status()).toBe('loading');
      expect(store.firstLoad()).toBe(true);

      pending.next(reviewsPage(1));
      expect(store.status()).toBe('loaded');
      expect(store.firstLoad()).toBe(false);
    });

    it('starts over when the product changes', () => {
      reviewsResult = ({ productId }) =>
        of(makeReviewsResponse([makeReview({ id: `${productId}-review` })], { page: 1, total: 1 }));
      const store = setup();

      store.loadProduct('a');
      store.loadProduct('b');

      expect(store.productId()).toBe('b');
      expect(store.page()).toBe(1);
      expect(reviewIds(store)).toEqual(['b-review']);
      expect(queries.map((query) => query.productId)).toEqual(['a', 'b']);
    });

    it('ignores a late response of the previous product', () => {
      const late = new Subject<ReviewsResponse>();
      reviewsResult = ({ productId }) =>
        productId === 'a'
          ? late
          : of(makeReviewsResponse([makeReview({ id: 'b-review' })], { page: 1, total: 1 }));
      const store = setup();

      store.loadProduct('a');
      store.loadProduct('b');
      late.next(makeReviewsResponse([makeReview({ id: 'a-review' })], { page: 1, total: 1 }));

      expect(reviewIds(store)).toEqual(['b-review']);
    });

    it('reloads whenever the product id signal changes', () => {
      const store = setup();
      const productId = signal('a');

      TestBed.runInInjectionContext(() => store.loadProduct(productId));
      TestBed.tick();
      expect(queries.map((query) => query.productId)).toEqual(['a']);

      productId.set('b');
      TestBed.tick();
      expect(queries.map((query) => query.productId)).toEqual(['a', 'b']);
      expect(store.productId()).toBe('b');
    });

    it('keeps the reviews when only the summary fails', () => {
      productResult = offline;
      const store = setup();

      store.loadProduct('product-1');

      expect(store.summary()).toBeNull();
      expect(reviewIds(store)).toEqual(['review-1']);
      expect(store.status()).toBe('loaded');
    });
  });

  describe('loadMore', () => {
    it('appends the next page instead of replacing the list', () => {
      const store = setup();
      store.loadProduct('product-1');

      store.loadMore();

      expect(pages()).toEqual([1, 2]);
      expect(reviewIds(store)).toEqual(['review-1', 'review-2']);
      expect(store.page()).toBe(2);
    });

    it('has no more pages once every review is loaded', () => {
      reviewsResult = ({ page = 1 }) => of(reviewsPage(page, 2));
      const store = setup();
      store.loadProduct('product-1');
      expect(store.hasMore()).toBe(true);

      store.loadMore();

      expect(store.hasMore()).toBe(false);
    });

    it('ignores extra clicks while a page is loading', () => {
      const second = new Subject<ReviewsResponse>();
      reviewsResult = ({ page = 1 }) => (page === 1 ? of(reviewsPage(1)) : second);
      const store = setup();
      store.loadProduct('product-1');

      store.loadMore();
      store.loadMore();

      expect(pages()).toEqual([1, 2]);
      expect(store.status()).toBe('loading');

      second.next(reviewsPage(2));
      expect(reviewIds(store)).toEqual(['review-1', 'review-2']);
    });

    it('does nothing before a product is set', () => {
      const store = setup();

      store.loadMore();

      expect(queries).toEqual([]);
    });
  });

  describe('errors', () => {
    it('shows the error state when the first page fails, then recovers on retry', () => {
      reviewsResult = offline;
      const store = setup();

      store.loadProduct('product-1');
      expect(store.status()).toBe('error');
      expect(store.reviews()).toEqual([]);

      reviewsResult = ({ page = 1 }) => of(reviewsPage(page));
      store.retry();

      expect(store.status()).toBe('loaded');
      expect(reviewIds(store)).toEqual(['review-1']);
    });

    it('keeps the loaded reviews when a later page fails and retries that same page', () => {
      reviewsResult = ({ page = 1 }) => (page === 1 ? of(reviewsPage(1)) : offline());
      const store = setup();
      store.loadProduct('product-1');

      store.loadMore();
      expect(store.status()).toBe('error');
      expect(reviewIds(store)).toEqual(['review-1']);

      reviewsResult = ({ page = 1 }) => of(reviewsPage(page));
      store.retry();

      expect(pages()).toEqual([1, 2, 2]);
      expect(reviewIds(store)).toEqual(['review-1', 'review-2']);
      expect(store.status()).toBe('loaded');
    });
  });

  describe('refresh', () => {
    it('goes back to the first page and replaces the list', () => {
      const store = setup();
      store.loadProduct('product-1');
      store.loadMore();

      store.refresh();

      expect(pages()).toEqual([1, 2, 1]);
      expect(store.page()).toBe(1);
      expect(reviewIds(store)).toEqual(['review-1']);
    });

    it('reloads the rating summary too', () => {
      const store = setup();
      store.loadProduct('product-1');
      productResult = () => of(productResponse(3, 9));

      store.refresh();

      expect(productIds).toEqual(['product-1', 'product-1']);
      expect(store.summary()).toEqual({ rating: 3, count: 9 });
    });

    it('does nothing before a product is set', () => {
      const store = setup();

      store.refresh();

      expect(queries).toEqual([]);
    });
  });
});
