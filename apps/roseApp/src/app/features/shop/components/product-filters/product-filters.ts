import { NgTemplateOutlet } from '@angular/common';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Check, LucideAngularModule, RotateCcw, Star, Tag, X } from 'lucide-angular';
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

  private readonly categoryList = viewChild<ElementRef<HTMLElement>>('categoryList');

  protected readonly Check = Check;
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

    // Bring the active category into view inside the (scrollable) list, e.g. when
    // arriving preselected from "Explore Similar Products".
    afterRenderEffect(() => {
      // Re-run when the selection changes or the categories finish loading.
      void this.filters().categoryId;
      void this.categories();
      const list = this.categoryList()?.nativeElement;
      const item = list?.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (list && item) this.scrollWithin(list, item);
    });
  }

  /** Scrolls only the list (never the page) so the item is centred if it is out of view. */
  private scrollWithin(list: HTMLElement, item: HTMLElement): void {
    const listRect = list.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    if (itemRect.top >= listRect.top && itemRect.bottom <= listRect.bottom) return;
    list.scrollTop += itemRect.top - listRect.top - (list.clientHeight - item.offsetHeight) / 2;
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
