// import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { GoogleMap, MapMarker } from '@angular/google-maps';
// import { By } from '@angular/platform-browser';
// import { Button } from '@org/ui';
// import { beforeEach, describe, expect, it, vi } from 'vitest';
// import { GoogleMapsLoader } from '../../../../../shared/business/google-maps-loader.service';
// import { GeolocationError, getCurrentPoint } from '../../../../../shared/utils/geolocation';
// import { EGYPT_BOUNDS, MAP_ZOOM } from './address-map.constants';
// import { AddressMapStep } from './address-map-step';

// vi.mock('../../../../../shared/utils/geocoding', () => ({
//   geocodeAddress: vi.fn(),
//   reverseGeocode: vi.fn(),
// }));

// vi.mock('../../../../../shared/utils/geolocation', async (importOriginal) => ({
//   ...(await importOriginal<typeof import('../../../../../shared/utils/geolocation')>()),
//   getCurrentPoint: vi.fn(),
// }));

// vi.mock('./address-map.constants', async (importOriginal) => ({
//   ...(await importOriginal<typeof import('./address-map.constants')>()),
//   createMarkerOptions: () => ({}),
// }));

// interface Coordinates {
//   lat: number;
//   lng: number;
// }

// interface GeocodeResult {
//   point: Coordinates;
//   precise: boolean;
// }

// // eslint-disable-next-line @angular-eslint/component-selector
// @Component({
//   selector: 'google-map',
//   template: '<ng-content />',
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// class GoogleMapStub {
//   readonly height = input<string>();
//   readonly width = input<string>();
//   readonly center = input<Coordinates>();
//   readonly zoom = input<number>();
//   readonly options = input<unknown>();
//   readonly mapClick = output<unknown>();
//   readonly zoomChanged = output<void>();
// }

// // eslint-disable-next-line @angular-eslint/component-selector
// @Component({
//   selector: 'map-marker',
//   template: '',
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// class MapMarkerStub {
//   readonly position = input<Coordinates>();
//   readonly options = input<unknown>();
//   readonly mapDragend = output<unknown>();
// }

// @Component({
//   selector: 'app-button',
//   template: '',
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// class ButtonStub {
//   readonly label = input('');
//   readonly disabled = input(false);
//   readonly fullWidth = input(false);
//   readonly bgColor = input('');
//   readonly textColor = input('');
//   readonly clicked = output<void>();
// }

// type Fixture = ComponentFixture<AddressMapStep>;

// const loader = { load: vi.fn() };

// const mapEvent = (lat: number, lng: number) => ({
//   latLng: { lat: () => lat, lng: () => lng },
// });

// const createFixture = (inputs: Record<string, unknown> = {}): Fixture => {
//   const fixture = TestBed.createComponent(AddressMapStep);
//   Object.entries(inputs).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
//   fixture.detectChanges();
//   return fixture;
// };

// const settle = async (fixture: Fixture): Promise<void> => {
//   for (let i = 0; i < 3; i++) {
//     await new Promise((resolve) => setTimeout(resolve, 0));
//     fixture.detectChanges();
//   }
// };

// const host = (fixture: Fixture): HTMLElement => fixture.nativeElement as HTMLElement;

// const byTestId = (fixture: Fixture, testId: string): HTMLElement | null =>
//   host(fixture).querySelector<HTMLElement>(`[data-testid="${testId}"]`);

// const clickTestId = (fixture: Fixture, testId: string): void => {
//   const element = byTestId(fixture, testId);
//   if (!element) throw new Error(`Missing element ${testId}`);
//   element.click();
// };

// const mapDebug = (fixture: Fixture) => fixture.debugElement.query(By.directive(GoogleMapStub));

// const markerDebug = (fixture: Fixture) => fixture.debugElement.query(By.directive(MapMarkerStub));

// const mapStub = (fixture: Fixture): GoogleMapStub => mapDebug(fixture).componentInstance as GoogleMapStub;

// const markerStub = (fixture: Fixture): MapMarkerStub =>
//   markerDebug(fixture).componentInstance as MapMarkerStub;

// const clickMap = (fixture: Fixture, lat: number, lng: number): void => {
//   mapDebug(fixture).triggerEventHandler('mapClick', mapEvent(lat, lng));
//   fixture.detectChanges();
// };

// const submit = (fixture: Fixture): void => {
//   fixture.debugElement.query(By.css('[data-testid="map-submit"]')).triggerEventHandler('clicked');
//   fixture.detectChanges();
// };

// describe('AddressMapStep', () => {
//   beforeEach(async () => {
//     vi.resetAllMocks();
//     loader.load.mockResolvedValue(undefined);
//     vi.mocked(geocodeAddress).mockResolvedValue(null);
//     vi.mocked(reverseGeocode).mockResolvedValue(null);

//     await TestBed.configureTestingModule({
//       imports: [AddressMapStep, TranslateModule.forRoot()],
//       providers: [{ provide: GoogleMapsLoader, useValue: loader }],
//     })
//       .overrideComponent(AddressMapStep, {
//         remove: { imports: [GoogleMap, MapMarker, Button] },
//         add: { imports: [GoogleMapStub, MapMarkerStub, ButtonStub] },
//       })
//       .compileComponents();
//   });

//   describe('map loading', () => {
//     it('shows the map once the loader resolves', async () => {
//       const fixture = createFixture();
//       await settle(fixture);

//       expect(mapDebug(fixture)).toBeTruthy();
//     });

//     it('shows an error when the loader rejects', async () => {
//       loader.load.mockRejectedValue(new Error('failed'));
//       const fixture = createFixture();
//       await settle(fixture);

//       expect(byTestId(fixture, 'map-failed')).not.toBeNull();
//       expect(mapDebug(fixture)).toBeNull();
//     });
//   });

//   describe('initial position', () => {
//     it('does not geocode when no city is given', async () => {
//       const fixture = createFixture();
//       await settle(fixture);

//       expect(geocodeAddress).not.toHaveBeenCalled();
//       expect(markerDebug(fixture)).toBeNull();
//     });

//     it('drops a pin when the street geocodes precisely', async () => {
//       vi.mocked(geocodeAddress).mockResolvedValueOnce({
//         point: { lat: 30.01, lng: 31.2 },
//         precise: true,
//       });
//       const fixture = createFixture({ city: ' Giza ', street: ' Pyramids Road ' });
//       await settle(fixture);

//       expect(geocodeAddress).toHaveBeenCalledWith('Pyramids Road, Giza', EGYPT_BOUNDS);
//       expect(markerStub(fixture).position()).toEqual({ lat: 30.01, lng: 31.2 });
//       expect(mapStub(fixture).center()).toEqual({ lat: 30.01, lng: 31.2 });
//       expect(mapStub(fixture).zoom()).toBe(MAP_ZOOM.pinned);
//     });

//     it('centers on the city without a pin when the street is imprecise', async () => {
//       vi.mocked(geocodeAddress)
//         .mockResolvedValueOnce({ point: { lat: 1, lng: 1 }, precise: false })
//         .mockResolvedValueOnce({ point: { lat: 30.0, lng: 31.1 }, precise: false });
//       const fixture = createFixture({ city: 'Giza', street: 'Pyramids Road' });
//       await settle(fixture);

//       expect(geocodeAddress).toHaveBeenCalledTimes(2);
//       expect(geocodeAddress).toHaveBeenLastCalledWith('Giza', EGYPT_BOUNDS);
//       expect(markerDebug(fixture)).toBeNull();
//       expect(mapStub(fixture).center()).toEqual({ lat: 30.0, lng: 31.1 });
//       expect(mapStub(fixture).zoom()).toBe(MAP_ZOOM.city);
//     });

//     it('geocodes only the city when the street is empty', async () => {
//       vi.mocked(geocodeAddress).mockResolvedValue({
//         point: { lat: 31.2, lng: 29.9 },
//         precise: false,
//       });
//       const fixture = createFixture({ city: 'Alexandria' });
//       await settle(fixture);

//       expect(geocodeAddress).toHaveBeenCalledTimes(1);
//       expect(geocodeAddress).toHaveBeenCalledWith('Alexandria', EGYPT_BOUNDS);
//     });

//     it('keeps the default center when nothing geocodes', async () => {
//       const fixture = createFixture({ city: 'Nowhere', street: 'Nothing here' });
//       await settle(fixture);

//       expect(markerDebug(fixture)).toBeNull();
//       expect(mapStub(fixture).zoom()).toBe(MAP_ZOOM.initial);
//     });

//     it('uses a saved point and skips geocoding', async () => {
//       const fixture = createFixture({
//         point: { lat: 30.5, lng: 31.5 },
//         city: 'Giza',
//         street: 'Road 9',
//       });
//       await settle(fixture);

//       expect(geocodeAddress).not.toHaveBeenCalled();
//       expect(markerStub(fixture).position()).toEqual({ lat: 30.5, lng: 31.5 });
//     });

//     it('does not override a pin picked while geocoding is pending', async () => {
//       let release: (value: GeocodeResult | null) => void = () => undefined;
//       vi.mocked(geocodeAddress).mockReturnValue(
//         new Promise<GeocodeResult | null>((resolve) => {
//           release = resolve;
//         }),
//       );
//       const fixture = createFixture({ city: 'Giza', street: 'Pyramids Road' });
//       await settle(fixture);

//       clickMap(fixture, 29.9, 31.1);
//       release({ point: { lat: 1, lng: 1 }, precise: true });
//       await settle(fixture);

//       expect(markerStub(fixture).position()).toEqual({ lat: 29.9, lng: 31.1 });
//     });
//   });

//   describe('picking a location', () => {
//     it('places the pin where the map is clicked', async () => {
//       const fixture = createFixture();
//       await settle(fixture);

//       clickMap(fixture, 30.2, 31.3);

//       expect(markerStub(fixture).position()).toEqual({ lat: 30.2, lng: 31.3 });
//     });

//     it('ignores clicks without coordinates', async () => {
//       const fixture = createFixture();
//       await settle(fixture);

//       mapDebug(fixture).triggerEventHandler('mapClick', { latLng: null });
//       fixture.detectChanges();

//       expect(markerDebug(fixture)).toBeNull();
//     });

//     it('moves the pin when it is dragged', async () => {
//       const fixture = createFixture({ point: { lat: 30, lng: 31 } });
//       await settle(fixture);

//       markerDebug(fixture).triggerEventHandler('mapDragend', mapEvent(30.7, 31.7));
//       fixture.detectChanges();

//       expect(markerStub(fixture).position()).toEqual({ lat: 30.7, lng: 31.7 });
//     });

//     it('shows the resolved address of the selected point', async () => {
//       vi.mocked(reverseGeocode).mockResolvedValue('1 Pyramids Rd, Giza');
//       const fixture = createFixture();
//       await settle(fixture);

//       clickMap(fixture, 30.2, 31.3);
//       await settle(fixture);

//       expect(reverseGeocode).toHaveBeenCalledWith({ lat: 30.2, lng: 31.3 });
//       expect(byTestId(fixture, 'resolved-address')?.textContent).toContain('1 Pyramids Rd, Giza');
//     });

//     it('hides the resolved address when reverse geocoding fails', async () => {
//       const fixture = createFixture();
//       await settle(fixture);

//       clickMap(fixture, 30.2, 31.3);
//       await settle(fixture);

//       expect(byTestId(fixture, 'resolved-address')).toBeNull();
//     });

//     it('keeps only the latest reverse geocoding result', async () => {
//       const resolvers: Array<(value: string | null) => void> = [];
//       vi.mocked(reverseGeocode).mockImplementation(
//         () => new Promise<string | null>((resolve) => resolvers.push(resolve)),
//       );
//       const fixture = createFixture();
//       await settle(fixture);

//       clickMap(fixture, 30.1, 31.1);
//       await settle(fixture);
//       clickMap(fixture, 30.2, 31.2);
//       await settle(fixture);

//       expect(resolvers).toHaveLength(2);
//       resolvers[1]?.('Second');
//       resolvers[0]?.('First');
//       await settle(fixture);

//       const label = byTestId(fixture, 'resolved-address')?.textContent ?? '';
//       expect(label).toContain('Second');
//       expect(label).not.toContain('First');
//     });
//   });

//   describe('current location', () => {
//     it('pins the current location and zooms in', async () => {
//       vi.mocked(getCurrentPoint).mockResolvedValue({ lat: 30.3, lng: 31.4 });
//       const fixture = createFixture();
//       await settle(fixture);

//       clickTestId(fixture, 'find-my-location');
//       await settle(fixture);

//       expect(markerStub(fixture).position()).toEqual({ lat: 30.3, lng: 31.4 });
//       expect(mapStub(fixture).zoom()).toBe(MAP_ZOOM.pinned);
//     });

//     it('shows the matching error when permission is denied', async () => {
//       vi.mocked(getCurrentPoint).mockRejectedValue(new GeolocationError('denied'));
//       const fixture = createFixture();
//       await settle(fixture);

//       clickTestId(fixture, 'find-my-location');
//       await settle(fixture);

//       expect(host(fixture).textContent).toContain('ADDRESS.ERRORS.GEO_DENIED');
//       expect(markerDebug(fixture)).toBeNull();
//     });

//     it('falls back to the generic error for unknown failures', async () => {
//       vi.mocked(getCurrentPoint).mockRejectedValue(new Error('boom'));
//       const fixture = createFixture();
//       await settle(fixture);

//       clickTestId(fixture, 'find-my-location');
//       await settle(fixture);

//       expect(host(fixture).textContent).toContain('ADDRESS.ERRORS.GEO_FAILED');
//     });

//     it('clears a previous error on the next attempt', async () => {
//       vi.mocked(getCurrentPoint)
//         .mockRejectedValueOnce(new GeolocationError('failed'))
//         .mockResolvedValueOnce({ lat: 30, lng: 31 });
//       const fixture = createFixture();
//       await settle(fixture);

//       clickTestId(fixture, 'find-my-location');
//       await settle(fixture);
//       expect(host(fixture).textContent).toContain('ADDRESS.ERRORS.GEO_FAILED');

//       clickTestId(fixture, 'find-my-location');
//       await settle(fixture);
//       expect(host(fixture).textContent).not.toContain('ADDRESS.ERRORS.GEO_FAILED');
//     });
//   });

//   describe('confirm and back', () => {
//     it('blocks confirm and shows an error when nothing is selected', async () => {
//       const fixture = createFixture();
//       const confirmed = vi.fn();
//       fixture.componentInstance.confirm.subscribe(confirmed);
//       await settle(fixture);

//       submit(fixture);

//       expect(confirmed).not.toHaveBeenCalled();
//       expect(host(fixture).textContent).toContain('ADDRESS.ERRORS.PICK_LOCATION');
//     });

//     it('emits the selected point on confirm', async () => {
//       const fixture = createFixture();
//       const confirmed = vi.fn();
//       fixture.componentInstance.confirm.subscribe(confirmed);
//       await settle(fixture);

//       clickMap(fixture, 30.2, 31.3);
//       submit(fixture);

//       expect(confirmed).toHaveBeenCalledWith({ lat: 30.2, lng: 31.3 });
//     });

//     it('does not confirm while saving', async () => {
//       const fixture = createFixture({ saving: true });
//       const confirmed = vi.fn();
//       fixture.componentInstance.confirm.subscribe(confirmed);
//       await settle(fixture);

//       clickMap(fixture, 30.2, 31.3);
//       submit(fixture);

//       expect(confirmed).not.toHaveBeenCalled();
//     });

//     it('emits null on back when nothing is selected', async () => {
//       const fixture = createFixture();
//       const back = vi.fn();
//       fixture.componentInstance.back.subscribe(back);
//       await settle(fixture);

//       clickTestId(fixture, 'map-back');

//       expect(back).toHaveBeenCalledWith(null);
//     });

//     it('emits the selected point on back', async () => {
//       const fixture = createFixture();
//       const back = vi.fn();
//       fixture.componentInstance.back.subscribe(back);
//       await settle(fixture);

//       clickMap(fixture, 30.2, 31.3);
//       clickTestId(fixture, 'map-back');

//       expect(back).toHaveBeenCalledWith({ lat: 30.2, lng: 31.3 });
//     });
//   });
// });
