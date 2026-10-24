import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';
import { PromoBanner, PromoCardVariant } from '../promo-banners.types';

@Component({
  selector: 'app-promo-card',
  imports: [RouterLink, TranslatePipe, LucideAngularModule],
  templateUrl: './promo-card.html',
  styleUrl: './promo-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.promo-card--hero]': "variant() === 'hero'",
  },
})
export class PromoCard {
  readonly banner = input.required<PromoBanner>();
  readonly variant = input<PromoCardVariant>('default');
  /** Load the image eagerly; use for above-the-fold cards only. */
  readonly priority = input(false);

  protected readonly ArrowRight = ArrowRight;
}
