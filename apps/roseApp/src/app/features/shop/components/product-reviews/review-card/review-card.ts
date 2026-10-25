import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Review } from '../../../interfaces/review.model/review-response';
import { RatingStars } from '../rating-stars/rating-stars';

@Component({
  selector: 'app-review-card',
  imports: [RatingStars],
  templateUrl: './review-card.html',
  styleUrl: './review-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewCard {
  private readonly translate = inject(TranslateService);

  readonly review = input.required<Review>();

  protected readonly authorName = computed(() => {
    const { firstName, lastName } = this.review().user;
    return `${firstName} ${lastName}`.trim();
  });

  protected readonly initial = computed(() => this.authorName().charAt(0).toUpperCase());

  // Formatted with Intl so the date follows the active language (e.g. "Apr 7, 2025" / "٧ أبريل ٢٠٢٥").
  protected readonly date = computed(() =>
    new Intl.DateTimeFormat(this.translate.currentLang() || 'en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(this.review().createdAt)),
  );
}
