import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '@org/ui';
import {
  ArrowLeft,
  BrushCleaning,
  LucideAngularModule,
  Minus,
  Plus,
  Star,
  Trash2,
} from 'lucide-angular';
import { ConfirmationDialogService } from '../../../../shared/business/confirmation-dialog.service';
import { finalPrice } from '../../../../shared/utils/product-price';
import { CartItem } from '../../interfaces/cart.model/cart.model';
import { CartStore } from '../../stores/cart/cart.store';

@Component({
  selector: 'app-cart',
  host: { class: 'block' },
  imports: [Button, LucideAngularModule, TranslatePipe, DecimalPipe, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cart {
  protected readonly arrowLeft = ArrowLeft;
  protected readonly brushCleaning = BrushCleaning;
  protected readonly star = Star;
  protected readonly trash2 = Trash2;
  protected readonly minus = Minus;
  protected readonly plus = Plus;

  protected readonly cart = inject(CartStore);
  private readonly confirmation = inject(ConfirmationDialogService);

  protected unitPrice(item: CartItem): number {
    return finalPrice(item.product);
  }

  protected onQuantityChange(item: CartItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Math.floor(Number(input.value));

    if (!Number.isFinite(value) || value < 1) {
      input.value = String(item.quantity);
      return;
    }

    if (value !== item.quantity) {
      this.cart.updateQuantity(item.id, value);
    }
  }

  protected async onClear(): Promise<void> {
    if (this.cart.count() === 0) return;

    const confirmed = await this.confirmation.confirm({
      message: 'CART.CONFIRM_CLEAR',
      icon: BrushCleaning,
    });

    if (confirmed) {
      this.cart.clear();
    }
  }
}
