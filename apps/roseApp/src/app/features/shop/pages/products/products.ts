import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
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
  filtersFromQueryParams,
  filtersToQueryParams,
  hasActiveFilters,
  ProductFilters,
  SIMILAR_TO_PARAM,
  similarProductFilters,
} from '../../utils/product-filters';
import { CartStore } from '../../stores/cart/cart.store';
import { WishlistStore } from '../../stores/wishlist/wishlist.store';
import { Pagination } from '@org/ui';
import { skipLoading } from '../../../../core/interceptors/loading.interceptor';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ProductCard, ProductFiltersPanel, Pagination, TranslatePipe, LucideAngularModule],
  templateUrl: './products.html',
  styleUrl: './products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products {
  private readonly catalog = inject(ProductCatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cart = inject(CartStore);
  protected readonly wishlist = inject(WishlistStore);

  protected readonly SlidersHorizontal = SlidersHorizontal;

  protected readonly loading = signal(true);
  protected readonly filtersOpen = signal(false);
  private readonly products = signal<Product[]>([]);
  private readonly similarTo = signal<string | null>(null);
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

  protected readonly first = computed(() => (this.page() - 1) * this.pageSize());

  constructor() {
    // Filters live in the URL so links (e.g. "Explore Similar Products") can preselect them.
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.filters.set(filtersFromQueryParams(params));
      this.similarTo.set(params.get(SIMILAR_TO_PARAM));
      this.page.set(1);
    });

    // "Explore Similar Products": once the full catalog is loaded, rebuild the filters
    // from the complete product (the wishlist's copy may lack occasions etc.).
    effect(() => {
      const id = this.similarTo();
      const products = this.products();
      if (!id || !products.length) return;
      const product = products.find((p) => p.id === id);
      this.similarTo.set(null);
      this.onFiltersChange(product ? similarProductFilters(product) : this.filters());
    });

    // The page renders its grid as soon as data arrives; skip the global full-screen overlay.
    this.catalog
      .loadAll(skipLoading())
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(),
      )
      .subscribe({ next: (products) => this.products.set(products), error: () => undefined });

    this.loadOptions(this.catalog.loadCategories(skipLoading()), this.categories.set.bind(this.categories));
    this.loadOptions(this.catalog.loadOccasions(skipLoading()), this.occasions.set.bind(this.occasions));
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
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: filtersToQueryParams(filters),
      replaceUrl: true,
    });
  }

  protected onPageChange(page: number): void {
    this.page.set(page);
  }

  protected onAddToCart(product: Product): void {
    this.cart.add(product.id);
  }

  protected onAddToWishlist(product: Product): void {
    this.wishlist.toggle(product.id);
  }
}
