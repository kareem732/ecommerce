import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LucideAngularModule, RotateCcw, Star, Tag, X } from 'lucide-angular';
import { MAX_STARS } from '../../../../shared/utils/product.constants';
import { Category, Occasion } from '../../interfaces/home.model/home-model-response';
import { OccasionTitlePipe } from '../../pipes/occasion-title.pipe';
import {
  EMPTY_PRODUCT_FILTERS,
  hasActiveFilters,
  ProductFilters,
} from '../../utils/product-filters';

type PriceKey = 'minPrice' | 'maxPrice';

/** Sidebar with category, occasion, rating and price filters (presentational). */
@Component({
  selector: 'app-product-filters',
  imports: [NgTemplateOutlet, TranslatePipe, LucideAngularModule, OccasionTitlePipe],
  templateUrl: './product-filters.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFiltersPanel {
  private readonly cdr = inject(ChangeDetectorRef);

  readonly categories = input.required<Category[]>();
  readonly occasions = input.required<Occasion[]>();
  readonly filters = input.required<ProductFilters>();

  readonly filtersChange = output<ProductFilters>();

  protected readonly Star = Star;
  protected readonly Tag = Tag;
  protected readonly X = X;
  protected readonly RotateCcw = RotateCcw;
  protected readonly stars = Array.from({ length: MAX_STARS }, (_, i) => i + 1);
  protected readonly hoveredRating = signal(0);
  protected readonly hasActiveFilters = hasActiveFilters;

  constructor() {
    // Occasion titles are translated through an impure pipe; refresh on language change.
    inject(TranslateService)
      .onLangChange.pipe(takeUntilDestroyed())
      .subscribe(() => this.cdr.markForCheck());
  }

  protected toggle(key: 'categoryId' | 'occasionId', id: string): void {
    this.update({ [key]: this.filters()[key] === id ? null : id });
  }

  protected toggleRating(stars: number): void {
    this.update({ minRating: this.filters().minRating === stars ? null : stars });
  }

  protected onPriceInput(key: PriceKey, event: Event): void {
    const raw = (event.target as HTMLInputElement).value.trim();
    const value = raw === '' ? null : Number(raw);
    this.update({ [key]: value === null || Number.isNaN(value) ? null : Math.max(0, value) });
  }

  protected reset(keys: (keyof ProductFilters)[]): void {
    const patch: Partial<ProductFilters> = {};
    for (const key of keys) patch[key] = null;
    this.update(patch);
  }

  protected resetAll(): void {
    this.filtersChange.emit(EMPTY_PRODUCT_FILTERS);
  }

  private update(patch: Partial<ProductFilters>): void {
    this.filtersChange.emit({ ...this.filters(), ...patch });
  }
}
