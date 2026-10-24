import { Component, input, output, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionService } from '@org/auth-service';
import { Observable, of, throwError } from 'rxjs';
import { ReviewsQuery } from '../../interfaces/review.model/review-request';
import { ReviewsResponse } from '../../interfaces/review.model/review-response';
import { ShopService } from '../../services/shop.service';
import { makeProduct } from '../../../../shared/utils/testing/product.fixtures';
import { makeReview, makeReviewsResponse } from '../../../../shared/utils/testing/review.fixtures';
import { provideTranslateTesting, useEnglish } from '../../../../shared/utils/testing/translate.testing';
import { ProductReviews } from './product-reviews';
import { REVIEWS_PAGE_SIZE } from './product-reviews.constants';
import { ReviewForm } from './review-form/review-form';

@Component({ selector: 'app-review-form', template: '' })
class ReviewFormStub {
  readonly productId = input.required<string>();
  readonly submitted = output<void>();
}

describe('ProductReviews', () => {
  let fixture: ComponentFixture<ProductReviews>;
  let element: HTMLElement;
  let queries: ReviewsQuery[];
  let reviewsResult: (query: ReviewsQuery) => Observable<ReviewsResponse>;

  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const cards = () => element.querySelectorAll('app-review-card');
  const button = (label: string) =>
    [...element.querySelectorAll('button')].find((b) => b.textContent?.includes(label));

  const form = () => element.querySelector('app-review-form');

  const setup = async (loggedIn = true) => {
    await TestBed.configureTestingModule({
      imports: [ProductReviews],
      providers: [
        provideTranslateTesting(),
        { provide: SessionService, useValue: { isLoggedIn: signal(loggedIn) } },
        {
          provide: ShopService,
          useValue: {
            getReviews: (query: ReviewsQuery) => {
              queries.push(query);
              return reviewsResult(query);
            },
            getProduct: () =>
              of({ status: true, code: 200, payload: { product: makeProduct({ rating: 13 / 3, ratings: 8 }) } }),
          },
        },
      ],
    })
      .overrideComponent(ProductReviews, {
        remove: { imports: [ReviewForm] },
        add: { imports: [ReviewFormStub] },
      })
      .compileComponents();
    useEnglish();

    fixture = TestBed.createComponent(ProductReviews);
    fixture.componentRef.setInput('productId', 'product-1');
    element = fixture.nativeElement;
    await settle();
  };

  beforeEach(() => {
    queries = [];
    reviewsResult = () => of(makeReviewsResponse([makeReview()]));
  });

  it('should load the first page of reviews for the product', async () => {
    await setup();

    expect(queries).toEqual([{ productId: 'product-1', page: 1, limit: REVIEWS_PAGE_SIZE }]);
    expect(cards().length).toBe(1);
  });

  it('should show the general rating with one decimal place', async () => {
    await setup();

    const summary = element.querySelector('.reviews__summary')?.textContent;
    expect(element.querySelector('.reviews__summary-value strong')?.textContent).toBe('4.3');
    expect(summary).toContain('(8 ratings)');
  });

  it('should show the add review form to logged-in users', async () => {
    await setup(true);

    expect(form()).not.toBeNull();
  });

  it('should hide the add review form from guests but still list the reviews', async () => {
    await setup(false);

    expect(form()).toBeNull();
    expect(cards().length).toBe(1);
  });

  it('should show an empty state when there are no reviews', async () => {
    reviewsResult = () => of(makeReviewsResponse([]));
    await setup();

    expect(cards().length).toBe(0);
    expect(element.textContent).toContain('No reviews yet');
  });

  it('should append the next page when showing more', async () => {
    reviewsResult = ({ page }) =>
      of(makeReviewsResponse([makeReview({ id: `review-${page}` })], { page, total: 2 }));
    await setup();

    button('Show more reviews')?.click();
    await settle();

    expect(queries.map((q) => q.page)).toEqual([1, 2]);
    expect(cards().length).toBe(2);
    expect(button('Show more reviews')).toBeUndefined();
  });

  it('should let the user retry after a failed load', async () => {
    reviewsResult = () => throwError(() => new Error('offline'));
    await setup();

    expect(element.textContent).toContain("We couldn't load the reviews.");

    reviewsResult = () => of(makeReviewsResponse([makeReview()]));
    button('Try again')?.click();
    await settle();

    expect(cards().length).toBe(1);
  });

  it('should reload from the first page after a review is added', async () => {
    reviewsResult = ({ page }) =>
      of(makeReviewsResponse([makeReview({ id: `review-${page}` })], { page, total: 3 }));
    await setup();
    button('Show more reviews')?.click();
    await settle();

    fixture.debugElement.query((de) => de.componentInstance instanceof ReviewFormStub)
      .componentInstance.submitted.emit();
    await settle();

    expect(queries.at(-1)?.page).toBe(1);
    expect(cards().length).toBe(1);
  });
});
