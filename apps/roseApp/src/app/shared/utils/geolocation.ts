export interface GeoPoint {
  lat: number;
  lng: number;
}

export type GeolocationFailure = 'unsupported' | 'denied' | 'failed';

export class GeolocationError extends Error {
  constructor(readonly reason: GeolocationFailure) {
    super(reason);
  }
}

export const getCurrentPoint = (options?: PositionOptions): Promise<GeoPoint> =>
  new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new GeolocationError('unsupported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      (error) =>
        reject(
          new GeolocationError(error.code === error.PERMISSION_DENIED ? 'denied' : 'failed'),
        ),
      options,
    );
  });
