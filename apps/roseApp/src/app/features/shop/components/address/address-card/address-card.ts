import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideAngularModule, Phone } from 'lucide-angular';
import { AddressLike } from '../../../interfaces/address.model/address.types';

@Component({
  selector: 'app-address-card',
  imports: [LucideAngularModule],
  templateUrl: './address-card.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressCard {
  readonly address = input.required<AddressLike>();
  readonly selected = input(false);
  readonly picked = output<string>();

  protected readonly phoneIcon = Phone;
}
