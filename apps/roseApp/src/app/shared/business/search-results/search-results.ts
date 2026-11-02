import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Spinner } from '@org/ui';
import { LucideAngularModule, Star } from 'lucide-angular';
import { Product } from '../../../features/shop/interfaces/home.model/home-model-response';
import { HighlightPipe } from '../../pipes/highlight.pipe';
import { finalPrice } from '../../utils/product-price';

/** Navbar search results: suggestions when empty, matches when typing. */
@Component({
  selector: 'app-search-results',
  imports: [DecimalPipe, RouterLink, TranslatePipe, LucideAngularModule, Spinner, HighlightPipe],
  templateUrl: './search-results.html',
  styleUrl: './search-results.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResults {
  readonly products = input.required<Product[]>();
  readonly term = input('');
  readonly loading = input(false);
  /** Fills its container (mobile drawer) instead of rendering as a floating dropdown. */
  readonly embedded = input(false);

  readonly selected = output<Product>();

  protected readonly Star = Star;
  protected readonly finalPrice = finalPrice;
}
