import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Button, Checkbox, Phone } from '@org/ui';
import { DEFAULT_ADDRESS_TITLE } from '../../../constants/address.constants';
import { AddressDetails } from '../../../interfaces/address.model/address.types';
import { egPhoneValidator } from '../../../utils/address.validators';
import { AddressTitlePicker } from '../address-title-picker/address-title-picker';
import {
  ADDRESS_FIELD_LIMITS,
  ADDRESS_FORM_ERROR_KEYS,
  FALLBACK_ERROR_KEY,
} from './address-details.config';

type FieldName = 'city' | 'street' | 'phone';

@Component({
  selector: 'app-address-details-step',
  imports: [ReactiveFormsModule, TranslatePipe, Button, Phone, Checkbox, AddressTitlePicker],
  templateUrl: './address-details-step.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressDetailsStep {
  readonly initial = input<AddressDetails | null>(null);
  readonly next = output<AddressDetails>();

  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly title = signal<string>(DEFAULT_ADDRESS_TITLE);
  protected readonly isPrimary = signal(false);

  protected readonly form = this.fb.group({
    city: ['', [Validators.required, Validators.maxLength(ADDRESS_FIELD_LIMITS.cityMax)]],
    street: [
      '',
      [
        Validators.required,
        Validators.minLength(ADDRESS_FIELD_LIMITS.streetMin),
        Validators.maxLength(ADDRESS_FIELD_LIMITS.streetMax),
      ],
    ],
    phone: ['', [Validators.required, egPhoneValidator]],
  });

  constructor() {
    effect(() => {
      const value = this.initial();
      if (!value) return;
      this.form.reset({ city: value.city, street: value.street, phone: value.phone });
      this.title.set(value.title);
      this.isPrimary.set(value.isPrimary);
    });
  }

  protected invalid(name: FieldName): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || control.dirty);
  }

  protected errorKey(name: FieldName): string {
    const errors = this.form.controls[name].errors;
    const code = errors && Object.keys(errors).find((key) => key in ADDRESS_FORM_ERROR_KEYS);
    return code ? ADDRESS_FORM_ERROR_KEYS[code] : FALLBACK_ERROR_KEY;
  }

  protected onNext(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { city, street, phone } = this.form.getRawValue();
    this.next.emit({
      title: this.title(),
      city: city.trim(),
      street: street.trim(),
      phone,
      isPrimary: this.isPrimary(),
    });
  }
}
