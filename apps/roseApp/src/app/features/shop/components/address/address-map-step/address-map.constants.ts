import { MapPoint } from '../../../interfaces/address.model/address.types';

export const CAIRO_CENTER: MapPoint = { lat: 30.0444, lng: 31.2357 };

export const EGYPT_BOUNDS: google.maps.LatLngBoundsLiteral = {
  north: 31.9,
  south: 21.7,
  east: 36.95,
  west: 24.6,
};

export const MAP_ZOOM = { initial: 13, city: 12, pinned: 16 } as const;

export const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 30_000,
};

export const GEOLOCATION_ERROR_KEYS = {
  unsupported: 'ADDRESS.ERRORS.GEO_UNSUPPORTED',
  denied: 'ADDRESS.ERRORS.GEO_DENIED',
  failed: 'ADDRESS.ERRORS.GEO_FAILED',
} as const;

export const MAP_OPTIONS: google.maps.MapOptions = {
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  gestureHandling: 'cooperative',
  minZoom: 6,
  restriction: { latLngBounds: EGYPT_BOUNDS, strictBounds: false },
};

const PIN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
  <path d="M16 0C7.2 0 0 7 0 15.7 0 27 16 42 16 42s16-15 16-26.3C32 7 24.8 0 16 0z" fill="#A6252A"/>
  <circle cx="16" cy="15.5" r="6" fill="#fff"/>
</svg>`;

const PIN_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(PIN_SVG)}`;

export const createMarkerOptions = (): google.maps.MarkerOptions => ({
  draggable: true,
  icon: {
    url: PIN_URL,
    scaledSize: new google.maps.Size(32, 42),
    anchor: new google.maps.Point(16, 42),
  },
});
