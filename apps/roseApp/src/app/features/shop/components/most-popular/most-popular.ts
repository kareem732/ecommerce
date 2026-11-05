import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';
import { Product } from '../../interfaces/home.model/home-model-response';
import { HomeStore } from '../../stores/home/home.store';
import { WishlistStore } from '../../stores/wishlist/wishlist.store';
import { SectionTitle } from '../../../../shared/ui/section-title/section-title';
import { OccasionFilter } from '../occasion-filter/occasion-filter';
import { ProductCard } from '../product-card/product-card';
import { CartService } from '../../services/cart.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-most-popular',
  imports: [
    OccasionFilter,
    ProductCard,
    RouterLink,
    SectionTitle,
    LucideAngularModule,
    TranslatePipe,
  ],
  templateUrl: './most-popular.html',
  styleUrl: './most-popular.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MostPopular {
  private readonly store = inject(HomeStore);
  protected readonly wishlist = inject(WishlistStore);
  protected readonly cartService = inject(CartService)
  protected readonly toastrService = inject(ToastrService)
  protected readonly ArrowRight = ArrowRight;
  protected readonly loading = this.store.popularLoading;
  protected readonly selectedId = this.store.selectedOccasionId;
  protected readonly occasions = this.store.occasions;
  protected readonly products = this.store.popular;
  protected onSelectOccasion(id: string | null): void {
    this.store.selectOccasion(id);
  }
  protected onAddToCart(product: Product): void {
    // console.log('add to cart', product.id);
    const body = {
      productId: product.id,
      quantity: 1,
    };
    this.cartService.addToCart(body).subscribe({
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
