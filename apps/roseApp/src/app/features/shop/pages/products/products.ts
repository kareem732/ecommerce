import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, switchMap, tap } from 'rxjs';
import { ProductCard } from '../../components/product-card/product-card';
import {
  Pagination,
  Product,
} from '../../interfaces/home.model/home-model-response';
import { ShopService } from '../../services/shop.service';
import { DEFAULT_PAGE_SIZE } from '../../interfaces/product-details.model/product-details.model';
import {
  PaginationChange,
  SharedPagination,
} from '../../../../shared/ui/shared-pagination/shared-pagination';
import { WishlistStore } from '../../stores/wishlist/wishlist.store';

@Component({
  selector: 'app-products',
  imports: [ProductCard, SharedPagination, TranslatePipe],
  templateUrl: './products.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products {
  private readonly shop = inject(ShopService);
  protected readonly wishlist = inject(WishlistStore);
  protected readonly products = signal<Product[]>([]);
  protected readonly pagination = signal<Pagination>({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });

  private readonly requestPage = rxMethod<{ page: number; limit: number }>(
    switchMap(({ page, limit }) =>
      this.shop.getProducts({ page, limit }).pipe(
        tap(({ payload }) => {
          this.products.set(payload.data);
          this.pagination.set(payload.metadata);
        }),
        catchError(() => EMPTY),
      ),
    ),
  );

  constructor() {
    this.requestPage({ page: 1, limit: DEFAULT_PAGE_SIZE });
  }

  protected onPageChange(event: PaginationChange): void {
    const current = this.pagination();
    const page = event.page + 1;
    const limit = event.rows;

    if (page === current.page && limit === current.limit) return;
    this.requestPage({ page, limit });
  }

  protected onAddToCart(product: Product): void {
    console.log('add to cart', product.id);
  }

  protected onAddToWishlist(product: Product): void {
    this.wishlist.toggle(product.id);
  }
}
