import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GoogleMapsLoader } from '../../../../../shared/business/google-maps-loader.service';
import { makeAddressLike } from '../../../../../shared/utils/testing/address.fixtures';
import {
  AddressDetails,
  AddressDraft,
  MapPoint,
} from '../../../interfaces/address.model/address.types';
import { AddressFormModal } from './address-form-modal';

interface Internals {
  step(): number;
  titleKey(): string;
  submitLabelKey(): string;
  details(): AddressDetails | null;
  point(): MapPoint | null;
  onDetailsNext(details: AddressDetails): void;
  onBack(point: MapPoint | null): void;
  onConfirm(point: MapPoint): void;
}

const DETAILS: AddressDetails = {
  city: 'Cairo',
  street: '14 Omar St',
  phone: '01112345678',
  isPrimary: false,
};
const POINT: MapPoint = { lat: 30.04, lng: 31.23 };

describe('AddressFormModal', () => {
  let fixture: ComponentFixture<AddressFormModal>;
  let saved: ReturnType<typeof vi.fn<(draft: AddressDraft) => void>>;

  const modal = () => fixture.componentInstance as unknown as Internals;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressFormModal],
      providers: [
        provideTranslateService(),
        { provide: GoogleMapsLoader, useValue: { load: () => new Promise<void>(() => undefined) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AddressFormModal);
    saved = vi.fn();
    fixture.componentInstance.save.subscribe(saved);
    fixture.detectChanges();
  });

  it('starts at step 1 in add mode', () => {
    expect(modal().step()).toBe(1);
    expect(modal().titleKey()).toBe('ADDRESS.ADD_TITLE');
    expect(modal().submitLabelKey()).toBe('ADDRESS.ADD_ADDRESS');
    expect(modal().details()).toBeNull();
  });

  it('uses the update texts and prefills from the edited address', () => {
    fixture.componentRef.setInput('address', makeAddressLike({ isPrimary: true }));
    fixture.detectChanges();

    expect(modal().titleKey()).toBe('ADDRESS.UPDATE_TITLE');
    expect(modal().submitLabelKey()).toBe('ADDRESS.UPDATE_ADDRESS');
    expect(modal().details()).toEqual({
      city: 'Giza',
      street: '21 Ahmad Mohamed St',
      phone: '+201012346578',
      isPrimary: true,
    });
    expect(modal().point()).toEqual({ lat: 30.01, lng: 31.2 });
  });

  it('moves to the map step with the typed details', () => {
    modal().onDetailsNext(DETAILS);
    fixture.detectChanges();

    expect(modal().step()).toBe(2);
    expect(fixture.nativeElement.querySelector('app-address-map-step')).not.toBeNull();
  });

  it('keeps the typed details and the picked point when going back', () => {
    modal().onDetailsNext(DETAILS);

    modal().onBack(POINT);

    expect(modal().step()).toBe(1);
    expect(modal().details()).toEqual(DETAILS);
    expect(modal().point()).toEqual(POINT);
  });

  it('keeps the previous point when going back without one', () => {
    modal().onDetailsNext(DETAILS);
    modal().onBack(POINT);

    modal().onBack(null);

    expect(modal().point()).toEqual(POINT);
  });

  it('emits the draft with details and coordinates on confirm', () => {
    modal().onDetailsNext(DETAILS);

    modal().onConfirm(POINT);

    expect(saved).toHaveBeenCalledWith({ ...DETAILS, ...POINT });
  });

  it('does not emit while saving or without details', () => {
    modal().onConfirm(POINT);
    modal().onDetailsNext(DETAILS);
    fixture.componentRef.setInput('saving', true);

    modal().onConfirm(POINT);

    expect(saved).not.toHaveBeenCalled();
  });
});
