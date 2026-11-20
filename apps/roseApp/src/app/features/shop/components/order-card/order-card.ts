import { DatePipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ArrowRight, Check, ChevronDown, ChevronUp, LucideAngularModule, MessageSquareHeart } from 'lucide-angular';
import {
  DELIVERY_STATUS_STYLE,
  ORDER_ITEMS_PREVIEW_COUNT,
  ORDER_PROGRESS,
  ORDER_PROGRESS_BADGE,
  PAYMENT_METHOD_ICON,
} from '../../constants/order.constants';
import { ORDERS_PATH } from '../../constants/shop-routes.constants';
import { OrderSummary } from '../../interfaces/order.model/order-history.model';

@Component({
  selector: 'app-order-card',
  imports: [DatePipe, DecimalPipe, NgTemplateOutlet, RouterLink, TranslatePipe, LucideAngularModule],
  templateUrl: './order-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderCard {
  readonly order = input.required<OrderSummary>();
  /** Hide the "details / review" links when the card is already on the details page. */
  readonly showActions = input(true);

  protected readonly Check = Check;
  protected readonly ChevronDown = ChevronDown;
  protected readonly ChevronUp = ChevronUp;
  protected readonly ArrowRight = ArrowRight;
  protected readonly ReviewIcon = MessageSquareHeart;
  protected readonly ordersPath = ORDERS_PATH;

  protected readonly expanded = signal(false);

  protected readonly orderNumber = computed(() => this.order().id.slice(0, 8).toUpperCase());
  protected readonly isPaid = computed(() => this.order().paymentStatus === 'SUCCEEDED');
  protected readonly progress = computed(() => ORDER_PROGRESS[this.order().status]);
  protected readonly isDelivered = computed(() => this.order().status === 'DELIVERED');
  protected readonly progressBadgeClass = computed(() => ORDER_PROGRESS_BADGE[this.progress()]);
  protected readonly deliveryStyle = computed(() => DELIVERY_STATUS_STYLE[this.progress()]);
  protected readonly paymentIcon = computed(() => PAYMENT_METHOD_ICON[this.order().paymentMethod]);

  protected readonly canExpand = computed(
    () => this.order().orderItems.length > ORDER_ITEMS_PREVIEW_COUNT,
  );
  protected readonly visibleItems = computed(() => {
    const items = this.order().orderItems;
    return this.expanded() ? items : items.slice(0, ORDER_ITEMS_PREVIEW_COUNT);
  });
  /** Next row shown faded behind the "Show all" button while collapsed. */
  protected readonly peekItems = computed(() =>
    this.expanded()
      ? []
      : this.order().orderItems.slice(ORDER_ITEMS_PREVIEW_COUNT, ORDER_ITEMS_PREVIEW_COUNT * 2),
  );

  protected toggleItems(): void {
    this.expanded.update((value) => !value);
  }
}
