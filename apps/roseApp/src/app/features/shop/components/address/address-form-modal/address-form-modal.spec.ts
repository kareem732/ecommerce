// import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { By } from '@angular/platform-browser';
// import { TranslateModule } from '@ngx-translate/core';
// import { beforeEach, describe, expect, it, vi } from 'vitest';
// import {
//   AddressDetails,
//   AddressLike,
//   MapPoint,
// } from '../../../interfaces/address.model/address.types';
// import { CheckoutSteps } from '../../checkout-steps/checkout-steps';
// import { AddressDetailsStep } from '../address-details-step/address-details-step';
// import { AddressMapStep } from '../address-map-step/address-map-step';
// import { AddressFormModal } from './address-form-modal';

// @Component({
//   selector: 'app-checkout-steps',
//   template: '',
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// class CheckoutStepsStub {
//   readonly currentStep = input<number>();
// }

// @Component({
//   selector: 'app-address-details-step',
//   template: '',
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// class DetailsStepStub {
//   readonly initial = input<AddressDetails | null>(null);
//   readonly next = output<AddressDetails>();
// }

// @Component({
//   selector: 'app-address-map-step',
//   template: '',
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// class MapStepStub {
//   readonly point = input<MapPoint | null>(null);
//   readonly city = input('');
//   readonly street = input('');
//   readonly saving = input(false);
//   readonly submitLabelKey = input('');
//   readonly back = output<MapPoint | null>();
//   readonly confirm = output<MapPoint>();
// }

// type Fixture = ComponentFixture<AddressFormModal>;

// const address: AddressLike = {
//   id: 'a1',
//   title: 'home',
//   city: 'Giza',
//   street: 'Pyramids Road 1',
//   phone: '01012345678',
//   isPrimary: false,
//   lat: 30.01,
//   lng: 31.2,
// };

// const details: AddressDetails = {
//   title: 'home',
//   city: 'Giza',
//   street: 'Pyramids Road 1',
//   phone: '01012345678',
//   isPrimary: false,
// };

// const detailsDebug = (fixture: Fixture) =>
//   fixture.debugElement.query(By.directive(DetailsStepStub));

// const mapDebug = (fixture: Fixture) => fixture.debugElement.query(By.directive(MapStepStub));

// const detailsStub = (fixture: Fixture): DetailsStepStub =>
//   detailsDebug(fixture).componentInstance as DetailsStepStub;

// const mapStub = (fixture: Fixture): MapStepStub => mapDebug(fixture).componentInstance as MapStepStub;

// const heading = (fixture: Fixture): string =>
//   (fixture.nativeElement as HTMLElement).querySelector('h2')?.textContent ?? '';

// const goNext = (fixture: Fixture, value: AddressDetails): void => {
//   detailsDebug(fixture).triggerEventHandler('next', value);
//   fixture.detectChanges();
// };

// const createFixture = (inputs: Record<string, unknown> = {}): Fixture => {
//   const fixture = TestBed.createComponent(AddressFormModal);
//   Object.entries(inputs).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
//   fixture.detectChanges();
//   return fixture;
// };

// describe('AddressFormModal', () => {
//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [AddressFormModal, TranslateModule.forRoot()],
//     })
//       .overrideComponent(AddressFormModal, {
//         remove: { imports: [CheckoutSteps, AddressDetailsStep, AddressMapStep] },
//         add: { imports: [CheckoutStepsStub, DetailsStepStub, MapStepStub] },
//       })
//       .compileComponents();
//   });

//   it('starts on the details step', () => {
//     const fixture = createFixture();

//     expect(detailsDebug(fixture)).toBeTruthy();
//     expect(mapDebug(fixture)).toBeNull();
//   });

//   it('uses the add title and label for a new address', () => {
//     const fixture = createFixture();

//     expect(heading(fixture)).toContain('ADDRESS.ADD_TITLE');

//     goNext(fixture, details);

//     expect(mapStub(fixture).submitLabelKey()).toBe('ADDRESS.ADD_ADDRESS');
//   });

//   it('uses the edit title and label for an existing address', () => {
//     const fixture = createFixture({ address });

//     expect(heading(fixture)).toContain('ADDRESS.UPDATE_TITLE');

//     goNext(fixture, details);

//     expect(mapStub(fixture).submitLabelKey()).toBe('ADDRESS.UPDATE_ADDRESS');
//   });

//   it('prefills the details step from the address', () => {
//     const fixture = createFixture({ address });

//     expect(detailsStub(fixture).initial()).toEqual(details);
//   });

//   it('moves to the map step and passes city and street', () => {
//     const fixture = createFixture();

//     goNext(fixture, { ...details, city: 'Alexandria', street: 'Corniche 5' });

//     expect(detailsDebug(fixture)).toBeNull();
//     expect(mapStub(fixture).city()).toBe('Alexandria');
//     expect(mapStub(fixture).street()).toBe('Corniche 5');
//   });

//   it('keeps the saved pin when city and street are unchanged', () => {
//     const fixture = createFixture({ address });

//     goNext(fixture, { ...details, phone: '01099999999' });

//     expect(mapStub(fixture).point()).toEqual({ lat: 30.01, lng: 31.2 });
//   });

//   it('clears the saved pin when the city changes', () => {
//     const fixture = createFixture({ address });

//     goNext(fixture, { ...details, city: 'Cairo' });

//     expect(mapStub(fixture).point()).toBeNull();
//   });

//   it('clears the saved pin when the street changes', () => {
//     const fixture = createFixture({ address });

//     goNext(fixture, { ...details, street: 'Another Street 2' });

//     expect(mapStub(fixture).point()).toBeNull();
//   });

//   it('passes no pin for a new address', () => {
//     const fixture = createFixture();

//     goNext(fixture, details);

//     expect(mapStub(fixture).point()).toBeNull();
//   });

//   it('returns to the details step and remembers the picked point', () => {
//     const fixture = createFixture();
//     goNext(fixture, details);

//     mapDebug(fixture).triggerEventHandler('back', { lat: 30.4, lng: 31.4 });
//     fixture.detectChanges();
//     expect(detailsDebug(fixture)).toBeTruthy();

//     goNext(fixture, details);
//     expect(mapStub(fixture).point()).toEqual({ lat: 30.4, lng: 31.4 });
//   });

//   it('keeps the previous pin when going back without one', () => {
//     const fixture = createFixture({ address });
//     goNext(fixture, details);

//     mapDebug(fixture).triggerEventHandler('back', null);
//     fixture.detectChanges();
//     goNext(fixture, details);

//     expect(mapStub(fixture).point()).toEqual({ lat: 30.01, lng: 31.2 });
//   });

//   it('emits the draft with details and coordinates on confirm', () => {
//     const fixture = createFixture();
//     const saved = vi.fn();
//     fixture.componentInstance.save.subscribe(saved);
//     goNext(fixture, details);

//     mapDebug(fixture).triggerEventHandler('confirm', { lat: 30.2, lng: 31.3 });

//     expect(saved).toHaveBeenCalledWith({ ...details, lat: 30.2, lng: 31.3 });
//   });

//   it('does not emit while saving', () => {
//     const fixture = createFixture({ saving: true });
//     const saved = vi.fn();
//     fixture.componentInstance.save.subscribe(saved);
//     goNext(fixture, details);

//     mapDebug(fixture).triggerEventHandler('confirm', { lat: 30.2, lng: 31.3 });

//     expect(saved).not.toHaveBeenCalled();
//   });
// });
