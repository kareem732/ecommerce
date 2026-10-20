import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';
import { map } from 'rxjs';
import { ProductSortBy, SortOrder } from '../../enums/product-sort';
import { Product } from '../../interfaces/home.model/home-model-response';
import { ShopService } from '../../services/shop.service';
import { ProductCard } from '../product-card/product-card';
import { Carousel } from '../carousel/carousel';

@Component({
  selector: 'app-best-selling',
  imports: [Carousel, ProductCard, RouterLink, TranslatePipe, LucideAngularModule],
  templateUrl: './best-selling.html',
  styleUrl: './best-selling.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BestSelling {
  private readonly shopService = inject(ShopService);

  protected readonly ArrowRight = ArrowRight;

  protected readonly products = toSignal(
    this.shopService
      .getProducts({
        page: 1,
        limit: 10,
        sortBy: ProductSortBy.BEST_SELLING,
        sortOrder: SortOrder.DESC,
      })
      .pipe(map((res) => res.payload.data)),
    { initialValue: [] as Product[] },
  );

  protected onAddToCart(product: Product): void {
    console.log('add to cart', product.id);
  }
}
