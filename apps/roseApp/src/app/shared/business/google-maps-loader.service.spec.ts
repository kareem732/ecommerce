import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GoogleMapsLoader } from './google-maps-loader.service';

const stubGoogle = () =>
  vi.stubGlobal('google', { maps: { importLibrary: vi.fn().mockResolvedValue({}) } });

const scripts = () => document.head.querySelectorAll('script[src*="maps.googleapis.com"]');

describe('GoogleMapsLoader', () => {
  let loader: GoogleMapsLoader;

  beforeEach(() => {
    loader = TestBed.inject(GoogleMapsLoader);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    scripts().forEach((script) => script.remove());
  });

  it('skips the script when the API is already available', async () => {
    stubGoogle();

    await loader.load();

    expect(scripts()).toHaveLength(0);
  });

  it('appends a single script for concurrent calls and imports the libraries', async () => {
    const first = loader.load();
    const second = loader.load();
    expect(scripts()).toHaveLength(1);

    stubGoogle();
    (scripts()[0] as HTMLScriptElement).onload?.(new Event('load'));
    await Promise.all([first, second]);

    expect(google.maps.importLibrary).toHaveBeenCalledTimes(3);
  });

  it('rejects when the script fails and retries on the next call', async () => {
    const failed = loader.load();
    (scripts()[0] as HTMLScriptElement).onerror?.(new Event('error'));

    await expect(failed).rejects.toThrow('Failed to load Google Maps');

    void loader.load();
    expect(scripts()).toHaveLength(2);
  });
});
