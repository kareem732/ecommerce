import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Card } from '@org/ui';
import { TranslatePipe } from '@ngx-translate/core';
import { Eye, Heart, LucideAngularModule, ShoppingCart, Star } from 'lucide-angular';
import { finalPrice, hasDiscount, isNew, isOutOfStock } from '../../../../shared/utils/product-price';
import { HOT_MIN_RATING, MAX_STARS } from '../../../../shared/utils/product.constants';
import { Product } from '../../interfaces/home.model/home-model-response';

@Component({
  selector: 'app-product-card',
  imports: [Card, DecimalPipe, TranslatePipe, LucideAngularModule, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  readonly product = input.required<Product>();

  readonly addToCart = output<Product>();
  readonly addToWishlist = output<Product>();

  protected readonly ShoppingCart = ShoppingCart;
  protected readonly Star = Star;
  protected readonly Heart = Heart;
  protected readonly Eye = Eye;
  protected readonly stars = Array.from({ length: MAX_STARS }, (_, i) => i + 1);

  protected readonly price = computed(() => finalPrice(this.product()));
  protected readonly discounted = computed(() => hasDiscount(this.product()));
  protected readonly isNew = computed(() => isNew(this.product()));
  protected readonly isHot = computed(() => this.product().rating >= HOT_MIN_RATING);
  protected readonly outOfStock = computed(() => isOutOfStock(this.product()));

  protected onAddToCart(event: Event): void {
    event.stopPropagation();
    if (!this.outOfStock()) {
      this.addToCart.emit(this.product());
    }
  }

  protected onAddToWishlist(event: Event): void {
    event.stopPropagation();
    this.addToWishlist.emit(this.product());
  }
}