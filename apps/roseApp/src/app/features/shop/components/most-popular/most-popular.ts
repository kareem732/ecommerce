import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { ProductSortBy, SortOrder } from '../../enums/product-sort';
import { Occasion, Product } from '../../interfaces/home.model/home-model-response';
import { ShopService } from '../../services/shop.service';
import { OccasionFilter } from '../occasion-filter/occasion-filter';
import { ProductCard } from '../product-card/product-card';
import { MOST_POPULAR_LIMIT } from './most-popular.constants';
import { SectionTitle } from '../../../../shared/ui/section-title/section-title';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'app-most-popular',
  imports: [OccasionFilter, ProductCard, RouterLink, SectionTitle, LucideAngularModule,TranslatePipe],
  templateUrl: './most-popular.html',
  styleUrl: './most-popular.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MostPopular {
  private readonly shopService = inject(ShopService);

  protected readonly ArrowRight = ArrowRight;
  protected readonly loading = signal(true);

  protected readonly selectedId = signal<string | null>(null);

  protected readonly occasions = toSignal(
    this.shopService.getOccasions().pipe(
      map((res) => res.payload.data),
      catchError(() => of([] as Occasion[])),
    ),
    { initialValue: [] as Occasion[] },
  );

  protected readonly products = toSignal(
    toObservable(this.selectedId).pipe(
      tap(() => this.loading.set(true)),
      switchMap((occasionId) =>
        this.shopService
          .getProducts({
            page: 1,
            limit: MOST_POPULAR_LIMIT,
            sortBy: ProductSortBy.MOST_POPULAR,
            sortOrder: SortOrder.DESC,
            ...(occasionId ? { occasionId } : {}),
          })
          .pipe(
            map((res) => res.payload.data),
            catchError(() => of([] as Product[])),
            tap(() => this.loading.set(false)),
          ),
      ),
    ),
    { initialValue: [] as Product[] },
  );

  protected onSelectOccasion(id: string | null): void {
    this.selectedId.set(id);
  }

  protected onAddToCart(product: Product): void {
    console.log('add to cart', product.id);
  }
}
