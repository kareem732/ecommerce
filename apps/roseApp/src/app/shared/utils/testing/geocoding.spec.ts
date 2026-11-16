import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { geocodeAddress, reverseGeocode } from './geocoding';

const geocode = vi.fn();

class FakeGeocoder {
  geocode = geocode;
}

const result = (locationType: string, lat = 30.05, lng = 31.23, formatted = 'Cairo, Egypt') => ({
  formatted_address: formatted,
  geometry: {
    location_type: locationType,
    location: { lat: () => lat, lng: () => lng },
  },
});

describe('geocoding', () => {
  beforeEach(() => {
    geocode.mockReset();
    Reflect.set(globalThis, 'google', {
      maps: { importLibrary: vi.fn().mockResolvedValue({ Geocoder: FakeGeocoder }) },
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'google');
  });

  describe('geocodeAddress', () => {
    it('marks ROOFTOP results as precise', async () => {
      geocode.mockResolvedValue({ results: [result('ROOFTOP', 30.1, 31.2)] });

      await expect(geocodeAddress('Street 1, Giza')).resolves.toEqual({
        point: { lat: 30.1, lng: 31.2 },
        precise: true,
      });
    });

    it('marks RANGE_INTERPOLATED results as precise', async () => {
      geocode.mockResolvedValue({ results: [result('RANGE_INTERPOLATED')] });

      const hit = await geocodeAddress('Street 1, Giza');

      expect(hit?.precise).toBe(true);
    });

    it('marks GEOMETRIC_CENTER results as not precise', async () => {
      geocode.mockResolvedValue({ results: [result('GEOMETRIC_CENTER')] });

      const hit = await geocodeAddress('Giza');

      expect(hit?.precise).toBe(false);
    });

    it('marks APPROXIMATE results as not precise', async () => {
      geocode.mockResolvedValue({ results: [result('APPROXIMATE')] });

      const hit = await geocodeAddress('Giza');

      expect(hit?.precise).toBe(false);
    });

    it('returns null when there are no results', async () => {
      geocode.mockResolvedValue({ results: [] });

      await expect(geocodeAddress('nowhere')).resolves.toBeNull();
    });

    it('returns null when the geocoder throws', async () => {
      geocode.mockRejectedValue(new Error('REQUEST_DENIED'));

      await expect(geocodeAddress('Giza')).resolves.toBeNull();
    });

    it('returns null when the library fails to load', async () => {
      Reflect.set(globalThis, 'google', {
        maps: { importLibrary: vi.fn().mockRejectedValue(new Error('load failed')) },
      });

      await expect(geocodeAddress('Giza')).resolves.toBeNull();
    });

    it('restricts the request to Egypt', async () => {
      geocode.mockResolvedValue({ results: [] });

      await geocodeAddress('Giza');

      expect(geocode).toHaveBeenCalledWith({
        address: 'Giza',
        region: 'EG',
        componentRestrictions: { country: 'EG' },
      });
    });

    it('forwards bounds when provided', async () => {
      const bounds = { north: 2, south: 1, east: 4, west: 3 };
      geocode.mockResolvedValue({ results: [] });

      await geocodeAddress('Giza', bounds);

      expect(geocode).toHaveBeenCalledWith(expect.objectContaining({ bounds }));
    });
  });

  describe('reverseGeocode', () => {
    it('returns the formatted address of the first result', async () => {
      geocode.mockResolvedValue({ results: [result('ROOFTOP', 1, 2, '1 Pyramids Rd, Giza')] });

      await expect(reverseGeocode({ lat: 1, lng: 2 })).resolves.toBe('1 Pyramids Rd, Giza');
      expect(geocode).toHaveBeenCalledWith({ location: { lat: 1, lng: 2 } });
    });

    it('returns null when there are no results', async () => {
      geocode.mockResolvedValue({ results: [] });

      await expect(reverseGeocode({ lat: 1, lng: 2 })).resolves.toBeNull();
    });

    it('returns null when the geocoder throws', async () => {
      geocode.mockRejectedValue(new Error('OVER_QUERY_LIMIT'));

      await expect(reverseGeocode({ lat: 1, lng: 2 })).resolves.toBeNull();
    });
  });
});
