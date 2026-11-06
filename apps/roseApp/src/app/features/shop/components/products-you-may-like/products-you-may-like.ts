import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SectionTitle } from '../../../../shared/ui/section-title/section-title';
import { Product } from '../../interfaces/home.model/home-model-response';
import { HomeStore } from '../../stores/home/home.store';
import { Carousel } from '../carousel/carousel';
import { ProductCard } from '../product-card/product-card';
import { CartStore } from '../../stores/cart/cart.store';

@Component({
  selector: 'app-products-you-may-like',
  imports: [Carousel, ProductCard, SectionTitle, TranslatePipe],
  templateUrl: './products-you-may-like.html',
  styleUrl: './products-you-may-like.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsYouMayLike {
  private readonly cart = inject(CartStore);
  protected readonly products = inject(HomeStore).bestSelling;

  protected onAddToCart(product: Product): void {
    this.cart.add(product.id);
  }
}
