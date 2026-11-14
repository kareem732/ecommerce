import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '@org/ui';
import { NotificationService } from '@org/auth-service';
import { ArrowLeft, ArrowRight, LucideAngularModule } from 'lucide-angular';
import { CheckoutSteps } from '../../components/checkout-steps/checkout-steps';
import { AddressStore } from '../../stores/address/address.store';
import { OrderService } from '../../services/order.service';
import { PaymentService } from '../../services/payment.service';
import { PaymentMethod as PaymentMethodType } from '../../interfaces/order.model/order.model';

@Component({
  selector: 'app-payment-method',
  imports: [LucideAngularModule, TranslatePipe, RouterLink, Button, CheckoutSteps],
  templateUrl: './payment-method.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMethod {
  private readonly addressStore = inject(AddressStore);
  private readonly orderService = inject(OrderService);
  private readonly paymentService = inject(PaymentService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly arrowLeft = ArrowLeft;
  protected readonly arrowRight = ArrowRight;

  protected readonly options: ReadonlyArray<{
    method: PaymentMethodType;
    image: string;
    titleKey: string;
    subtitleKey: string;
  }> = [
    {
      method: 'CASH_ON_DELIVERY',
      image: '/images/payment/cash-on-delivery.png',
      titleKey: 'SHOP.PAYMENT.COD_TITLE',
      subtitleKey: 'SHOP.PAYMENT.COD_SUBTITLE',
    },
    {
      method: 'CREDIT_CARD',
      image: '/images/payment/credit-card.png',
      titleKey: 'SHOP.PAYMENT.CC_TITLE',
      subtitleKey: 'SHOP.PAYMENT.CC_SUBTITLE',
    },
  ];

  protected readonly selected = signal<PaymentMethodType>('CREDIT_CARD');
  protected readonly loading = signal(false);

  protected select(method: PaymentMethodType): void {
    this.selected.set(method);
  }

  protected onCheckout(): void {
    const addressId = this.addressStore.selectedId();
    if (!addressId) {
      this.notifications.error('SHOP.PAYMENT.NO_ADDRESS');
      void this.router.navigate(['/shop/cart/shipping-address']);
      return;
    }

    const method = this.selected();
    this.loading.set(true);

    const redirectUrls =
      method === 'CREDIT_CARD' ? this.buildRedirectUrls() : {};

    this.orderService
      .createOrder({ addressId, paymentMethod: method, ...redirectUrls })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (method === 'CASH_ON_DELIVERY') {
            this.loading.set(false);
            void this.router.navigate(['/shop/payment-success']);
            return;
          }
          this.startCardPayment(res.payload.order.id);
        },
        error: () => {
          this.loading.set(false);
          this.notifications.error('SHOP.PAYMENT.ORDER_ERROR');
        },
      });
  }

  private buildRedirectUrls(): { successUrl: string; cancelUrl: string } {
    const origin = window.location.origin;

    if (window.location.hostname === 'localhost') {
      return { successUrl: `${origin}/`, cancelUrl: `${origin}/?pc=1` };
    }

    const base = (origin + window.location.pathname).replace(
      /\/shop\/cart\/payment.*$/i,
      '',
    );
    return {
      successUrl: `${base}/shop/payment-success`,
      cancelUrl: `${base}/shop/payment-cancel`,
    };
  }

  private startCardPayment(orderId: string): void {
    this.paymentService
      .createCheckoutSession({ orderId, ...this.buildRedirectUrls() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          window.location.href = res.payload.checkoutUrl;
        },
        error: () => {
          this.loading.set(false);
          this.notifications.error('SHOP.PAYMENT.CHECKOUT_ERROR');
        },
      });
  }
}
