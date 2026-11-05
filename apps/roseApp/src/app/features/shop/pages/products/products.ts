import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, SlidersHorizontal } from 'lucide-angular';
import { catchError, finalize, Observable, of } from 'rxjs';
import { ProductCard } from '../../components/product-card/product-card';
import { ProductFiltersPanel } from '../../components/product-filters/product-filters';
import { Category, Occasion, Product } from '../../interfaces/home.model/home-model-response';
import { DEFAULT_PAGE_SIZE } from '../../interfaces/product-details.model/product-details.model';
import { ProductCatalogService } from '../../services/product-catalog.service';
import {
  EMPTY_PRODUCT_FILTERS,
  filterProducts,
  hasActiveFilters,
  ProductFilters,
} from '../../utils/product-filters';
import {
  PaginationChange,
  SharedPagination,
} from '../../../../shared/ui/shared-pagination/shared-pagination';
import { WishlistStore } from '../../stores/wishlist/wishlist.store';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ProductCard, ProductFiltersPanel, SharedPagination, TranslatePipe, LucideAngularModule],
  templateUrl: './products.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products {
  private readonly catalog = inject(ProductCatalogService);
  protected readonly wishlist = inject(WishlistStore);

  protected readonly SlidersHorizontal = SlidersHorizontal;

  protected readonly loading = signal(true);
  protected readonly filtersOpen = signal(false);
  private readonly products = signal<Product[]>([]);
  protected readonly filters = signal<ProductFilters>(EMPTY_PRODUCT_FILTERS);
  protected readonly page = signal(1);
  protected readonly pageSize = signal(DEFAULT_PAGE_SIZE);

  protected readonly categories = signal<Category[]>([]);
  protected readonly occasions = signal<Occasion[]>([]);
  protected readonly filtered = computed(() => filterProducts(this.products(), this.filters()));
  protected readonly visible = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });
  protected readonly hasActiveFilters = computed(() => hasActiveFilters(this.filters()));

  constructor() {
    this.catalog
      .loadAll()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(),
      )
      .subscribe({ next: (products) => this.products.set(products), error: () => undefined });

    // Filter options are optional: if they fail, the products still show.
    this.loadOptions(this.catalog.loadCategories(), this.categories.set.bind(this.categories));
    this.loadOptions(this.catalog.loadOccasions(), this.occasions.set.bind(this.occasions));
  }

  private loadOptions<T>(source: Observable<T[]>, set: (items: T[]) => void): void {
    source
      .pipe(
        catchError(() => of([])),
        takeUntilDestroyed(),
      )
      .subscribe(set);
  }

  protected onFiltersChange(filters: ProductFilters): void {
    this.filters.set(filters);
    this.page.set(1);
  }

  protected onPageChange({ page, rows }: PaginationChange): void {
    this.page.set(page + 1);
    this.pageSize.set(rows);
  }

  protected onAddToCart(product: Product): void {
    console.log('add to cart', product.id);
  }

  protected onAddToWishlist(product: Product): void {
    this.wishlist.toggle(product.id);
  }
}