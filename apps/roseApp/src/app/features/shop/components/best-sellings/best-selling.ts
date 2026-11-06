import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';
import { Product } from '../../interfaces/home.model/home-model-response';
import { CartStore } from '../../stores/cart/cart.store';
import { HomeStore } from '../../stores/home/home.store';
import { WishlistStore } from '../../stores/wishlist/wishlist.store';
import { Carousel } from '../carousel/carousel';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'app-best-selling',
  imports: [Carousel, ProductCard, RouterLink, TranslatePipe, LucideAngularModule],
  templateUrl: './best-selling.html',
  styleUrl: './best-selling.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BestSelling {
  private readonly cart = inject(CartStore);
  protected readonly wishlist = inject(WishlistStore);
  protected readonly ArrowRight = ArrowRight;
  protected readonly products = inject(HomeStore).bestSelling;

  protected onAddToCart(product: Product): void {
    this.cart.add(product.id);
  }

  protected onAddToWishlist(product: Product): void {
    this.wishlist.toggle(product.id);
  }
}
