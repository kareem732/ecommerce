import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { provideTranslateService } from '@ngx-translate/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GoogleMapsLoader } from '../../../../../shared/business/google-maps-loader.service';
import { GeolocationError, getCurrentPoint } from '../../../../../shared/utils/geolocation';
import { AddressMapStep } from './address-map-step';

vi.mock('../../../../../shared/utils/geolocation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../../../shared/utils/geolocation')>()),
  getCurrentPoint: vi.fn(),
}));

interface Internals {
  selected(): { lat: number; lng: number } | null;
  center(): { lat: number; lng: number };
  zoom(): number;
  locationError(): string | null;
  onMapClick(event: unknown): void;
  findMyLocation(): Promise<void>;
}

const PIN = { lat: 30.05, lng: 31.24 };
const clickAt = ({ lat, lng }: typeof PIN) => ({ latLng: { lat: () => lat, lng: () => lng } });

describe('AddressMapStep', () => {
  let fixture: ComponentFixture<AddressMapStep>;
  let load: ReturnType<typeof vi.fn>;

  const internals = () => fixture.componentInstance as unknown as Internals;
  const byTestId = (id: string) => fixture.nativeElement.querySelector(`[data-testid="${id}"]`);

  const settle = async () => {
    await Promise.resolve();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const create = async () => {
    fixture = TestBed.createComponent(AddressMapStep);
    fixture.detectChanges();
    await settle();
  };

  beforeEach(() => {
    vi.stubGlobal('google', { maps: { Size: class {}, Point: class {} } });
    load = vi.fn().mockResolvedValue(undefined);
    TestBed.configureTestingModule({
      imports: [AddressMapStep],
      providers: [provideTranslateService(), { provide: GoogleMapsLoader, useValue: { load } }],
    });
    TestBed.overrideComponent(AddressMapStep, {
      remove: { imports: [GoogleMap, MapMarker] },
      add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.mocked(getCurrentPoint).mockReset();
  });

  it('renders the map once the API is loaded', async () => {
    await create();

    expect(fixture.nativeElement.querySelector('google-map')).not.toBeNull();
    expect(byTestId('map-failed')).toBeNull();
  });

  it('shows the failure message when the API cannot be loaded', async () => {
    load.mockRejectedValue(new Error('blocked'));

    await create();

    expect(byTestId('map-failed')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('google-map')).toBeNull();
  });

  it('asks for a location before confirming', async () => {
    await create();
    const spy = vi.fn();
    fixture.componentInstance.confirm.subscribe(spy);

    byTestId('map-submit').dispatchEvent(new CustomEvent('clicked'));
    (fixture.componentInstance as unknown as { onConfirm(): void }).onConfirm();
    fixture.detectChanges();

    expect(spy).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
  });

  it('emits the point picked on the map', async () => {
    await create();
    const spy = vi.fn();
    fixture.componentInstance.confirm.subscribe(spy);

    internals().onMapClick(clickAt(PIN));
    (fixture.componentInstance as unknown as { onConfirm(): void }).onConfirm();

    expect(spy).toHaveBeenCalledWith(PIN);
  });

  it('does not confirm while saving', async () => {
    await create();
    const spy = vi.fn();
    fixture.componentInstance.confirm.subscribe(spy);
    fixture.componentRef.setInput('saving', true);

    internals().onMapClick(clickAt(PIN));
    (fixture.componentInstance as unknown as { onConfirm(): void }).onConfirm();

    expect(spy).not.toHaveBeenCalled();
  });

  it('selects and pans to the initial point', async () => {
    fixture = TestBed.createComponent(AddressMapStep);
    fixture.componentRef.setInput('point', PIN);
    fixture.detectChanges();
    await settle();

    expect(internals().selected()).toEqual(PIN);
    expect(internals().center()).toEqual(PIN);
    expect(internals().zoom()).toBe(16);
  });

  it('emits the current selection when going back', async () => {
    await create();
    const spy = vi.fn();
    fixture.componentInstance.back.subscribe(spy);

    internals().onMapClick(clickAt(PIN));
    byTestId('map-back').click();

    expect(spy).toHaveBeenCalledWith(PIN);
  });

  it('moves to the device location', async () => {
    vi.mocked(getCurrentPoint).mockResolvedValue(PIN);
    await create();

    await internals().findMyLocation();

    expect(internals().selected()).toEqual(PIN);
    expect(internals().center()).toEqual(PIN);
  });

  it('shows the geolocation error', async () => {
    vi.mocked(getCurrentPoint).mockRejectedValue(new GeolocationError('denied'));
    await create();

    await internals().findMyLocation();
    fixture.detectChanges();

    expect(internals().locationError()).toBe('ADDRESS.ERRORS.GEO_DENIED');
    expect(internals().selected()).toBeNull();
  });
});
