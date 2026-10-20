import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ProductSortBy, SortOrder } from '../../enums/product-sort';
import { Product } from '../../interfaces/home.model/home-model-response';
import { ShopService } from '../../services/shop.service';
import { Carousel } from '../carousel/carousel';
import { ProductCard } from '../product-card/product-card';
import { SectionTitle } from '../../../../shared/ui/section-title/section-title';

@Component({
  selector: 'app-related-products',
  imports: [Carousel, ProductCard, SectionTitle],
  templateUrl: './related-products.html',
  styleUrl: './related-products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelatedProducts {
  private readonly shopService = inject(ShopService);

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
