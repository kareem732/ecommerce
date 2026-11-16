import { Component, inject, signal } from '@angular/core';
import { Check, ChevronDown, ChevronUp, LucideAngularModule, Star, Truck, Wallet } from 'lucide-angular';
import { finalPrice } from '../../../../shared/utils/product-price';
import { CartItem } from '../../interfaces/cart.model/cart.model';
import { CartStore } from '../../stores/cart/cart.store';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ShopService } from '../../services/shop.service';
import { order } from '../../interfaces/order.model/order-history.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-order',
  imports: [LucideAngularModule, DecimalPipe, TranslatePipe, DatePipe],
  templateUrl: './order.html',
  styleUrl: './order.scss',
})
export class Order {
  protected readonly Check = Check
  protected readonly Wallet = Wallet
  protected readonly Truck = Truck
  protected readonly star = Star;
  protected readonly chevronDown = ChevronDown;
  protected readonly chevronUp = ChevronUp;

  protected readonly cart = inject(CartStore);
  private readonly shopService = inject(ShopService)

  expandedOrders = signal<Set<string>>(new Set())
  orders = signal<order[]>([]);
  loading = signal<boolean>(false);

  ngOnInit(): void {
    this.cart.load();
    this.getOrders();
  }

  protected unitPrice(item: CartItem): number {
    return finalPrice(item.product);
  }

  isOrderExpanded(orderId: string): boolean {
    return this.expandedOrders().has(orderId);
  }

  toggleOrderItems(orderId: string): void {
    this.expandedOrders.update(current => {
      const updated = new Set(current);

      if (updated.has(orderId)) {
        updated.delete(orderId);
      } else {
        updated.add(orderId);
      }

      return updated;
    });
  }

  getOrders() {
    this.loading.set(true);

    this.shopService.getOrderHistory().subscribe({
      next: (res) => {
        console.log(res);
        console.log('Orders:', res.payload.data);
        this.orders.set(res.payload.data);

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Orders API Error:', err);

        this.loading.set(false);
      }
    });
  }
}
