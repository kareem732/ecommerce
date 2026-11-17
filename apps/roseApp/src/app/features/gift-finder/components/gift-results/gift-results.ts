import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '@org/ui';
import { LucideAngularModule, RotateCcw, Sparkles } from 'lucide-angular';
import { ProductCard } from '../../../shop/components/product-card/product-card';
import { Product } from '../../../shop/interfaces/home.model/home-model-response';
import { CartStore } from '../../../shop/stores/cart/cart.store';
import { WishlistStore } from '../../../shop/stores/wishlist/wishlist.store';
import { GiftMatch, RecipientId } from '../../interfaces/gift-finder.models';

@Component({
  selector: 'app-gift-results',
  imports: [TranslatePipe, LucideAngularModule, Button, ProductCard],
  templateUrl: './gift-results.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GiftResults {
  private readonly cart = inject(CartStore);
  protected readonly wishlist = inject(WishlistStore);

  readonly matches = input.required<GiftMatch[]>();
  readonly searching = input(false);
  readonly failed = input(false);
  readonly relaxed = input(false);
  readonly recipient = input<RecipientId | null>(null);

  readonly retry = output<void>();
  readonly restart = output<void>();

  protected readonly Sparkles = Sparkles;
  protected readonly RotateCcw = RotateCcw;
  protected readonly skeletons = [0, 1, 2, 3];

  protected addToCart(product: Product): void {
    this.cart.add(product.id);
  }

  protected toggleWishlist(product: Product): void {
    this.wishlist.toggle(product.id);
  }
}
