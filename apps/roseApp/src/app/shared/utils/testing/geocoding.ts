import { GeoPoint } from "../geolocation";

export interface GeocodeHit {
  point: GeoPoint;
  precise: boolean;
}

const createGeocoder = async (): Promise<google.maps.Geocoder> => {
  const { Geocoder } = (await google.maps.importLibrary(
    'geocoding',
  )) as google.maps.GeocodingLibrary;
  return new Geocoder();
};

export const geocodeAddress = async (
  address: string,
  bounds?: google.maps.LatLngBoundsLiteral,
): Promise<GeocodeHit | null> => {
  try {
    const geocoder = await createGeocoder();
    const { results } = await geocoder.geocode({
      address,
      region: 'EG',
      componentRestrictions: { country: 'EG' },
      ...(bounds ? { bounds } : {}),
    });
    const best = results[0];
    if (!best) return null;

    const locationType = String(best.geometry.location_type);
    return {
      point: { lat: best.geometry.location.lat(), lng: best.geometry.location.lng() },
      precise: locationType === 'ROOFTOP' || locationType === 'RANGE_INTERPOLATED',
    };
  } catch {
    return null;
  }
};

export const reverseGeocode = async (point: GeoPoint): Promise<string | null> => {
  try {
    const geocoder = await createGeocoder();
    const { results } = await geocoder.geocode({ location: point });
    return results[0]?.formatted_address ?? null;
  } catch {
    return null;
  }
};
