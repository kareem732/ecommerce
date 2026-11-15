import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import {
  AddressDetails,
  AddressDraft,
  AddressLike,
  MapPoint,
} from '../../../interfaces/address.model/address.types';
import { toAddressDetails, toMapPoint } from '../../../utils/address.mapper';
import { CheckoutSteps } from '../../checkout-steps/checkout-steps';
import { AddressDetailsStep } from '../address-details-step/address-details-step';
import { AddressMapStep } from '../address-map-step/address-map-step';

type Step = 1 | 2;

@Component({
  selector: 'app-address-form-modal',
  imports: [TranslatePipe, CheckoutSteps, AddressDetailsStep, AddressMapStep],
  templateUrl: './address-form-modal.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressFormModal {
  readonly address = input<AddressLike | null>(null);
  readonly saving = input(false);

  readonly save = output<AddressDraft>();

  protected readonly step = signal<Step>(1);
  protected readonly details = linkedSignal<AddressDetails | null>(() =>
    toAddressDetails(this.address()),
  );
  protected readonly point = linkedSignal<MapPoint | null>(() => toMapPoint(this.address()));

  protected readonly isEdit = computed(() => this.address() !== null);
  protected readonly titleKey = computed(() =>
    this.isEdit() ? 'ADDRESS.UPDATE_TITLE' : 'ADDRESS.ADD_TITLE',
  );
  protected readonly submitLabelKey = computed(() =>
    this.isEdit() ? 'ADDRESS.UPDATE_ADDRESS' : 'ADDRESS.ADD_ADDRESS',
  );

  protected onDetailsNext(details: AddressDetails): void {
    const previous = this.details();
    if (previous && (previous.city !== details.city || previous.street !== details.street)) {
      this.point.set(null);
    }
    this.details.set(details);
    this.step.set(2);
  }

  protected onBack(point: MapPoint | null): void {
    if (point) this.point.set(point);
    this.step.set(1);
  }

  protected onConfirm(point: MapPoint): void {
    const details = this.details();
    if (!details || this.saving()) return;
    this.point.set(point);
    this.save.emit({ ...details, ...point });
  }
}
