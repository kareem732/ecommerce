import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '@org/ui';
import { ArrowLeft, LocateFixed, LucideAngularModule } from 'lucide-angular';
import { GoogleMapsLoader } from '../../../../../shared/business/google-maps-loader.service';
import { GeolocationError, getCurrentPoint } from '../../../../../shared/utils/geolocation';
import { MapPoint } from '../../../interfaces/address.model/address.types';
import {
  CAIRO_CENTER,
  createMarkerOptions,
  GEOLOCATION_ERROR_KEYS,
  GEOLOCATION_OPTIONS,
  MAP_OPTIONS,
  MAP_ZOOM,
} from './address-map.constants';

type MapStatus = 'loading' | 'ready' | 'failed';

@Component({
  selector: 'app-address-map-step',
  imports: [TranslatePipe, Button, LucideAngularModule, GoogleMap, MapMarker],
  templateUrl: './address-map-step.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressMapStep {
  readonly point = input<MapPoint | null>(null);
  readonly saving = input(false);
  readonly submitLabelKey = input('ADDRESS.ADD_ADDRESS');

  readonly back = output<MapPoint | null>();
  readonly confirm = output<MapPoint>();

  private readonly loader = inject(GoogleMapsLoader);
  private readonly gmap = viewChild(GoogleMap);

  protected readonly arrowLeft = ArrowLeft;
  protected readonly locateIcon = LocateFixed;
  protected readonly mapOptions = MAP_OPTIONS;

  protected readonly status = signal<MapStatus>('loading');
  protected readonly markerOptions = signal<google.maps.MarkerOptions | undefined>(undefined);
  protected readonly selected = signal<MapPoint | null>(null);
  protected readonly center = signal<MapPoint>({ ...CAIRO_CENTER });
  protected readonly zoom = signal<number>(MAP_ZOOM.initial);
  protected readonly locating = signal(false);
  protected readonly locationError = signal<string | null>(null);
  protected readonly submitted = signal(false);

  protected readonly showPickError = computed(() => this.submitted() && !this.selected());

  constructor() {
    afterNextRender(() => {
      this.loader.load().then(
        () => {
          this.markerOptions.set(createMarkerOptions());
          this.status.set('ready');
        },
        () => this.status.set('failed'),
      );
    });

    effect(() => {
      const point = this.point();
      if (point) untracked(() => this.setPoint(point, true));
    });
  }

  protected onMapClick(event: google.maps.MapMouseEvent): void {
    this.pickFrom(event);
  }

  protected onMarkerDragEnd(event: google.maps.MapMouseEvent): void {
    this.pickFrom(event);
  }

  protected onZoomChanged(): void {
    const zoom = this.gmap()?.getZoom();
    if (zoom !== undefined) this.zoom.set(zoom);
  }

  protected async findMyLocation(): Promise<void> {
    this.locating.set(true);
    this.locationError.set(null);
    try {
      this.setPoint(await getCurrentPoint(GEOLOCATION_OPTIONS), true);
    } catch (error) {
      const reason = error instanceof GeolocationError ? error.reason : 'failed';
      this.locationError.set(GEOLOCATION_ERROR_KEYS[reason]);
    } finally {
      this.locating.set(false);
    }
  }

  protected onBack(): void {
    this.back.emit(this.selected());
  }

  protected onConfirm(): void {
    this.submitted.set(true);
    const point = this.selected();
    if (!point || this.saving()) return;
    this.confirm.emit(point);
  }

  private pickFrom(event: google.maps.MapMouseEvent): void {
    const latLng = event.latLng;
    if (latLng) this.setPoint({ lat: latLng.lat(), lng: latLng.lng() }, false);
  }

  private setPoint(point: MapPoint, pan: boolean): void {
    this.selected.set({ ...point });
    if (!pan) return;
    this.center.set({ ...point });
    this.zoom.update((zoom) => Math.max(zoom, MAP_ZOOM.pinned));
  }
}
