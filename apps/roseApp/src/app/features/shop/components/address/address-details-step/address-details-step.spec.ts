import { WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AddressDetails } from '../../../interfaces/address.model/address.types';
import { AddressDetailsStep } from './address-details-step';

interface Values {
  city: string;
  street: string;
  phone: string;
}

interface Internals {
  form: { setValue(value: Values): void; getRawValue(): Values };
  isPrimary: WritableSignal<boolean>;
  onNext(): void;
  errorKey(name: 'city' | 'street' | 'phone'): string;
}

const VALID: Values = { city: 'Cairo', street: '14 Omar Ibn Alkhatab St', phone: '01112345678' };

describe('AddressDetailsStep', () => {
  let fixture: ComponentFixture<AddressDetailsStep>;
  let internals: Internals;
  let emitted: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressDetailsStep],
      providers: [provideTranslateService()],
    }).compileComponents();
    fixture = TestBed.createComponent(AddressDetailsStep);
    internals = fixture.componentInstance as unknown as Internals;
    emitted = vi.fn();
    fixture.componentInstance.next.subscribe(emitted);
    fixture.detectChanges();
  });

  const query = (selector: string) => fixture.nativeElement.querySelector(selector);

  it('does not emit and shows the errors when the form is invalid', () => {
    internals.onNext();
    fixture.detectChanges();

    expect(emitted).not.toHaveBeenCalled();
    expect(query('#address-city-error')).not.toBeNull();
    expect(query('#address-street-error')).not.toBeNull();
  });

  it('rejects an invalid Egyptian mobile number', () => {
    internals.form.setValue({ ...VALID, phone: '123' });

    internals.onNext();

    expect(emitted).not.toHaveBeenCalled();
  });

  it('emits trimmed values together with the primary flag', () => {
    internals.form.setValue({ city: ' Cairo ', street: ' 14 Omar Ibn Alkhatab St ', phone: '01112345678' });
    internals.isPrimary.set(true);

    internals.onNext();

    expect(emitted).toHaveBeenCalledWith({
      city: 'Cairo',
      street: '14 Omar Ibn Alkhatab St',
      phone: '01112345678',
      isPrimary: true,
    });
  });

  it('fills the form from the initial input', () => {
    const initial: AddressDetails = {
      city: 'Giza',
      street: '21 Ahmad Mohamed St',
      phone: '+201012346578',
      isPrimary: true,
    };

    fixture.componentRef.setInput('initial', initial);
    fixture.detectChanges();

    expect(internals.form.getRawValue()).toEqual({
      city: 'Giza',
      street: '21 Ahmad Mohamed St',
      phone: '+201012346578',
    });
    expect(internals.isPrimary()).toBe(true);
  });

  it('maps validation errors to translation keys', () => {
    internals.form.setValue({ city: '', street: 'abc', phone: '123' });

    expect(internals.errorKey('city')).toBe('ADDRESS.ERRORS.REQUIRED');
    expect(internals.errorKey('street')).toBe('ADDRESS.ERRORS.STREET_SHORT');
    expect(internals.errorKey('phone')).toBe('ADDRESS.ERRORS.PHONE_INVALID');
  });
});
