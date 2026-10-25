import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SessionService } from '@org/auth-service';
import { Button, Spinner } from '@org/ui';
import { SectionTitle } from '../../../../shared/ui/section-title/section-title';
import { ReviewsStore } from '../../stores/reviews/reviews.store';
import { RatingStars } from './rating-stars/rating-stars';
import { ReviewCard } from './review-card/review-card';
import { ReviewForm } from './review-form/review-form';
@Component({
  selector: 'app-product-reviews',
  imports: [DecimalPipe, TranslatePipe, Button, Spinner, SectionTitle, RatingStars, ReviewCard, ReviewForm],
  templateUrl: './product-reviews.html',
  styleUrl: './product-reviews.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ReviewsStore],
})
export class ProductReviews {
  private readonly store = inject(ReviewsStore);
  readonly productId = input.required<string>();
  protected readonly isLoggedIn = inject(SessionService).isLoggedIn;
  protected readonly reviews = this.store.reviews;
  protected readonly status = this.store.status;
  protected readonly summary = this.store.summary;
  protected readonly hasMore = this.store.hasMore;
  protected readonly firstLoad = this.store.firstLoad;

  constructor() {
    this.store.loadProduct(this.productId);
  }

  protected loadMore(): void {
    this.store.loadMore();
  }

  protected retry(): void {
    this.store.retry();
  }

  protected onReviewAdded(): void {
    this.store.refresh();
  }
}
