import { afterEach, describe, expect, it } from 'vitest';
import { GeolocationError, getCurrentPoint } from './geolocation';

type Impl = (
  success: (position: unknown) => void,
  error: (reason: unknown) => void,
) => void;

const stubGeolocation = (impl: Impl) =>
  Object.defineProperty(navigator, 'geolocation', {
    value: { getCurrentPosition: impl },
    configurable: true,
  });

describe('getCurrentPoint', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'geolocation');
  });

  it('rejects as unsupported when geolocation is missing', async () => {
    await expect(getCurrentPoint()).rejects.toMatchObject({ reason: 'unsupported' });
  });

  it('resolves with the device coordinates', async () => {
    stubGeolocation((success) => success({ coords: { latitude: 30.1, longitude: 31.2 } }));

    await expect(getCurrentPoint()).resolves.toEqual({ lat: 30.1, lng: 31.2 });
  });

  it('rejects as denied when the permission is refused', async () => {
    stubGeolocation((_, error) => error({ code: 1, PERMISSION_DENIED: 1 }));

    const result = getCurrentPoint();

    await expect(result).rejects.toBeInstanceOf(GeolocationError);
    await expect(result).rejects.toMatchObject({ reason: 'denied' });
  });

  it('rejects as failed for any other error', async () => {
    stubGeolocation((_, error) => error({ code: 2, PERMISSION_DENIED: 1 }));

    await expect(getCurrentPoint()).rejects.toMatchObject({ reason: 'failed' });
  });
});
