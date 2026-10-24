import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, Star, StarHalf } from 'lucide-angular';
import { MAX_STARS } from '../../../../../shared/utils/product.constants';

type StarFill = 'full' | 'half' | 'empty';

/** Read-only star row that supports half stars (e.g. 4.5). */
@Component({
  selector: 'app-rating-stars',
  imports: [LucideAngularModule, TranslatePipe],
  templateUrl: './rating-stars.html',
  styleUrl: './rating-stars.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingStars {
  readonly rating = input.required<number>();
  readonly size = input(16);

  protected readonly Star = Star;
  protected readonly StarHalf = StarHalf;

  protected readonly stars = computed<StarFill[]>(() => {
    // Round to the nearest half so 4.3 reads as 4.5 stars, not 4.
    const rounded = Math.round(this.rating() * 2) / 2;
    return Array.from({ length: MAX_STARS }, (_, i) => {
      if (rounded >= i + 1) return 'full';
      if (rounded >= i + 0.5) return 'half';
      return 'empty';
    });
  });
}
