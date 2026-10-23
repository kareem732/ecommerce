import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { SessionService } from '@org/auth-service';
import { Button, Spinner } from '@org/ui';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { SectionTitle } from '../../../../shared/ui/section-title/section-title';
import { Review } from '../../interfaces/review.model/review-response';
import { ShopService } from '../../services/shop.service';
import { REVIEWS_PAGE_SIZE } from './product-reviews.constants';
import { RatingStars } from './rating-stars/rating-stars';
import { ReviewCard } from './review-card/review-card';
import { ReviewForm } from './review-form/review-form';

type LoadStatus = 'loading' | 'loaded' | 'error';

interface RatingSummary {
  rating: number;
  count: number;
}

/**
 * Self-contained reviews section: it only needs the product id and loads
 * the rating summary and the paginated reviews on its own. The "add review"
 * form is shown to logged-in users only.
 *
 * Usage: <app-product-reviews [productId]="product.id" />
 */
@Component({
  selector: 'app-product-reviews',
  imports: [DecimalPipe, TranslatePipe, Button, Spinner, SectionTitle, RatingStars, ReviewCard, ReviewForm],
  templateUrl: './product-reviews.html',
  styleUrl: './product-reviews.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductReviews {
  private readonly shopService = inject(ShopService);

  readonly productId = input.required<string>();

  // Only logged-in users can write a review, so guests don't see the form at all.
  protected readonly isLoggedIn = inject(SessionService).isLoggedIn;

  // Back to the first page whenever the product changes.
  private readonly page = linkedSignal({ source: this.productId, computation: () => 1 });
  private readonly reload = signal(0);

  protected readonly reviews = signal<Review[]>([]);
  protected readonly total = signal(0);
  protected readonly status = signal<LoadStatus>('loading');
  protected readonly summary = signal<RatingSummary | null>(null);

  protected readonly hasMore = computed(() => this.reviews().length < this.total());
  protected readonly firstLoad = computed(() => this.status() === 'loading' && !this.reviews().length);

  constructor() {
    toObservable(computed(() => ({ productId: this.productId(), page: this.page(), reload: this.reload() })))
      .pipe(
        tap(() => this.status.set('loading')),
        switchMap(({ productId, page }) =>
          this.shopService.getReviews({ productId, page, limit: REVIEWS_PAGE_SIZE }).pipe(
            map((res) => ({ page, payload: res.payload })),
            catchError(() => of(null)),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((result) => {
        if (!result) return this.status.set('error');
        const { page, payload } = result;
        this.reviews.update((list) => (page === 1 ? payload.data : [...list, ...payload.data]));
        this.total.set(payload.metadata.total);
        this.status.set('loaded');
      });

    toObservable(computed(() => ({ productId: this.productId(), reload: this.reload() })))
      .pipe(
        switchMap(({ productId }) =>
          this.shopService.getProduct(productId).pipe(
            map(({ payload: { product } }) => ({ rating: product.rating, count: product.ratings })),
            catchError(() => of(null)),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((summary) => this.summary.set(summary));
  }

  protected loadMore(): void {
    this.page.update((page) => page + 1);
  }

  protected retry(): void {
    this.reload.update((n) => n + 1);
  }

  // A new review changes both the list and the average, so start over.
  protected onReviewAdded(): void {
    this.page.set(1);
    this.reload.update((n) => n + 1);
  }
}
