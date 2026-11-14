import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { NotificationService } from '@org/auth-service';
import { of } from 'rxjs';
import {
  provideTranslateTesting,
  useEnglish,
} from '../../../../shared/utils/testing/translate.testing';
import { AddressStore } from '../../stores/address/address.store';
import { OrderService } from '../../services/order.service';
import { PaymentService } from '../../services/payment.service';
import { PaymentMethod } from './payment-method';

interface Internals {
  select(method: 'CASH_ON_DELIVERY' | 'CREDIT_CARD'): void;
  onCheckout(): void;
}

describe('PaymentMethod', () => {
  const selectedId = signal<string | null>(null);
  const createOrder = vi.fn();
  const createCheckoutSession = vi.fn();
  const notifications = { error: vi.fn(), success: vi.fn() };

  let fixture: ComponentFixture<PaymentMethod>;
  let component: Internals;
  let navigate: ReturnType<typeof vi.spyOn>;

  const setup = async (address: string | null = 'addr-1') => {
    selectedId.set(address);
    createOrder.mockReset().mockReturnValue(
      of({ status: true, code: 201, payload: { order: { id: 'order-1' }, checkout: null } }),
    );
    createCheckoutSession.mockReset().mockReturnValue(
      of({ status: true, code: 201, payload: { checkoutUrl: 'https://checkout.stripe.com/x' } }),
    );
    notifications.error.mockReset();

    await TestBed.configureTestingModule({
      imports: [PaymentMethod],
      providers: [
        provideRouter([]),
        provideTranslateTesting(),
        { provide: AddressStore, useValue: { selectedId } },
        { provide: OrderService, useValue: { createOrder } },
        { provide: PaymentService, useValue: { createCheckoutSession } },
        { provide: NotificationService, useValue: notifications },
      ],
    }).compileComponents();
    useEnglish();

    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(PaymentMethod);
    fixture.detectChanges();
    component = fixture.componentInstance as unknown as Internals;
  };

  it('should create', async () => {
    await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('defaults the selection to Credit Card', async () => {
    await setup();
    const checked = fixture.nativeElement.querySelector('[role="radio"][aria-checked="true"]');
    expect(checked?.textContent).toContain('Credit Card');
  });

  it('redirects to shipping address when none is selected', async () => {
    await setup(null);
    component.onCheckout();
    expect(createOrder).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/shop/cart/shipping-address']);
  });

  it('places a cash-on-delivery order and goes to the success page', async () => {
    await setup('addr-1');
    component.select('CASH_ON_DELIVERY');
    component.onCheckout();
    expect(createOrder).toHaveBeenCalledWith({
      addressId: 'addr-1',
      paymentMethod: 'CASH_ON_DELIVERY',
    });
    expect(navigate).toHaveBeenCalledWith(['/shop/payment-success']);
    expect(createCheckoutSession).not.toHaveBeenCalled();
  });

  it('creates a checkout session for a credit-card order', async () => {
    await setup('addr-1');
    component.select('CREDIT_CARD');
    component.onCheckout();
    expect(createOrder).toHaveBeenCalledWith(
      expect.objectContaining({ addressId: 'addr-1', paymentMethod: 'CREDIT_CARD' }),
    );
    expect(createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: 'order-1' }),
    );
  });
});
