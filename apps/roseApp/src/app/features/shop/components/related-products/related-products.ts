import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SectionTitle } from '../../../../shared/ui/section-title/section-title';
import { Product } from '../../interfaces/home.model/home-model-response';
import { CartStore } from '../../stores/cart/cart.store';
import { HomeStore } from '../../stores/home/home.store';
import { WishlistStore } from '../../stores/wishlist/wishlist.store';
import { Carousel } from '../carousel/carousel';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'app-related-products',
  imports: [Carousel, ProductCard, SectionTitle, TranslatePipe],
  templateUrl: './related-products.html',
  styleUrl: './related-products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelatedProducts {
  private readonly cart = inject(CartStore);
  protected readonly wishlist = inject(WishlistStore);
  protected readonly products = inject(HomeStore).bestSelling;

  protected onAddToCart(product: Product): void {
    this.cart.add(product.id);
  }

  protected onAddToWishlist(product: Product): void {
    this.wishlist.toggle(product.id);
  }
}
