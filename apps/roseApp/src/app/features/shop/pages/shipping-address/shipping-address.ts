import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '@org/ui';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';
import { nextRovingIndex } from '../../../../shared/utils/keyboard-navigation';
import { AddressCard } from '../../components/address/address-card/address-card';
import { MyAddressesModal } from '../../components/address/my-addresses-modal/my-addresses-modal';
import { CheckoutSteps } from '../../components/checkout-steps/checkout-steps';
import { AddressStore } from '../../stores/address/address.store';

@Component({
  selector: 'app-shipping-address',
  imports: [
    Button,
    LucideAngularModule,
    TranslatePipe,
    CheckoutSteps,
    AddressCard,
    MyAddressesModal,
  ],
  templateUrl: './shipping-address.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShippingAddress {
  protected readonly store = inject(AddressStore);

  protected readonly arrowRight = ArrowRight;
  protected readonly skeletonRows = [1, 2, 3];
  protected readonly addressesOpen = signal(false);
  protected readonly startWithForm = signal(false);

  constructor() {
    void this.store.load();
  }

  protected onAddAddress(): void {
    this.startWithForm.set(this.store.count() === 0);
    this.addressesOpen.set(true);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const items = this.store.items();
    const current = items.findIndex((a) => a.id === this.store.selectedId());
    const next = nextRovingIndex(event.key, current, items.length);
    if (next === null) return;

    event.preventDefault();
    this.store.select(items[next].id);
    (event.currentTarget as HTMLElement)
      .querySelectorAll<HTMLElement>('[role="radio"]')
      [next]?.focus();
  }

  protected onNext(): void {
    if (!this.store.selectedAddress()) return;
  }
}
