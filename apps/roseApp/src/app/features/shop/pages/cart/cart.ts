import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Button, Input } from '@org/ui';
import {
  ArrowLeft,
  ArrowRight,
  BrushCleaning,
  LucideAngularModule,
  Minus,
  Plus,
  Star,
  TicketPercent,
  Trash2,
} from 'lucide-angular';
import { ConfirmationDialogService } from '../../../../shared/business/confirmation-dialog.service';
import { SectionTitle } from '../../../../shared/ui/section-title/section-title';
import { finalPrice } from '../../../../shared/utils/product-price';
import { Carousel } from '../../components/carousel/carousel';
import { ProductCard } from '../../components/product-card/product-card';
import { CartItem } from '../../interfaces/cart.model/cart.model';
import { Product } from '../../interfaces/home.model/home-model-response';
import { CartStore } from '../../stores/cart/cart.store';
import { HomeStore } from '../../stores/home/home.store';
import { WishlistStore } from '../../stores/wishlist/wishlist.store';

@Component({
  selector: 'app-cart',
  imports: [
    Button,
    LucideAngularModule,
    Input,
    SectionTitle,
    ProductCard,
    Carousel,
    TranslatePipe,
    DecimalPipe,
    RouterLink,
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cart implements OnInit {
  protected readonly ticketPercent = TicketPercent;
  protected readonly arrowRight = ArrowRight;
  protected readonly arrowLeft = ArrowLeft;
  protected readonly brushCleaning = BrushCleaning;
  protected readonly star = Star;
  protected readonly trash2 = Trash2;
  protected readonly minus = Minus;
  protected readonly plus = Plus;

  protected readonly cart = inject(CartStore);
  protected readonly wishlist = inject(WishlistStore);
  protected readonly products = inject(HomeStore).bestSelling;
  private readonly confirmation = inject(ConfirmationDialogService);

  protected readonly total = computed(() => this.cart.subtotal());

  ngOnInit(): void {
    this.cart.load();
  }

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

  protected onAddToCart(product: Product): void {
    this.cart.add(product.id);
  }

  protected onAddToWishlist(product: Product): void {
    this.wishlist.toggle(product.id);
  }
}
