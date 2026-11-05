import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';
import { Product } from '../../interfaces/home.model/home-model-response';
import { HomeStore } from '../../stores/home/home.store';
import { WishlistStore } from '../../stores/wishlist/wishlist.store';
import { ProductCard } from '../product-card/product-card';
import { Carousel } from '../carousel/carousel';
import { CartService } from '../../services/cart.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-best-selling',
  imports: [
    Carousel,
    ProductCard,
    RouterLink,
    TranslatePipe,
    LucideAngularModule,
  ],
  templateUrl: './best-selling.html',
  styleUrl: './best-selling.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BestSelling {
  protected readonly wishlist = inject(WishlistStore)
  protected readonly cartService = inject(CartService)
  protected readonly toastrService = inject(ToastrService)
  protected readonly ArrowRight = ArrowRight;
  protected readonly products = inject(HomeStore).bestSelling;
  protected onAddToCart(product: Product): void {
    // console.log('add to cart', product.id);
    const body = {
      productId: product.id,
      quantity: 1,
    };
    this.cartService.addToCart(body). subscribe({
      next: (res) => {
        console.log('Added to cart successfully', res);
        this.toastrService.success('Added to cart successfully','Rose App')
        
      },
      error: (err) => {
        console.error('Error adding product to cart', err);
      }
    });
  }
  protected onAddToWishlist(product: Product): void {
    this.wishlist.toggle(product.id);
  }
}
