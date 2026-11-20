import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ArrowRight, Gift, LucideAngularModule } from 'lucide-angular';
import { GIFT_FINDER_PATH } from '../../constants/gift-finder.constants';

/** Home page call-to-action leading to the Gift Finder. */
@Component({
  selector: 'app-gift-finder-banner',
  imports: [RouterLink, TranslatePipe, LucideAngularModule],
  templateUrl: './gift-finder-banner.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GiftFinderBanner {
  protected readonly path = GIFT_FINDER_PATH;
  protected readonly Gift = Gift;
  protected readonly ArrowRight = ArrowRight;
}
