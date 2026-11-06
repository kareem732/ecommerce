import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  ArrowLeft,
  BrushCleaning,
  FolderHeart,
  LucideAngularModule,
  ShoppingCart,
  Star,
  Trash2,
} from 'lucide-angular';
import { ConfirmationDialogService } from '../../../../shared/business/confirmation-dialog.service';
import { finalPrice, hasDiscount, isOutOfStock } from '../../../../shared/utils/product-price';
import { Product } from '../../interfaces/home.model/home-model-response';
import { CartStore } from '../../stores/cart/cart.store';
import { WishlistStore } from '../../stores/wishlist/wishlist.store';

@Component({
  selector: 'app-wishlist',
  imports: [DecimalPipe, RouterLink, TranslatePipe, LucideAngularModule],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Wishlist {
  protected readonly store = inject(WishlistStore);
  private readonly cart = inject(CartStore);
  private readonly confirmation = inject(ConfirmationDialogService);

  protected readonly FolderHeart = FolderHeart;
  protected readonly BrushCleaning = BrushCleaning;
  protected readonly Trash2 = Trash2;
  protected readonly ShoppingCart = ShoppingCart;
  protected readonly Star = Star;
  protected readonly ArrowLeft = ArrowLeft;

  protected readonly finalPrice = finalPrice;
  protected readonly hasDiscount = hasDiscount;
  protected readonly isOutOfStock = isOutOfStock;

  constructor() {
    this.store.load();
  }

  protected async onClear(): Promise<void> {
    const confirmed = await this.confirmation.confirm({
      message: 'WISHLIST.CONFIRM_CLEAR',
      icon: BrushCleaning,
    });

    if (confirmed) {
      this.store.clear();
    }
  }

  protected addToCart(product: Product): void {
    this.cart.add(product.id);
  }
}
