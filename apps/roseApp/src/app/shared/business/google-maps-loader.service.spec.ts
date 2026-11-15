import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { GoogleMapsLoader } from './google-maps-loader.service';

const findScripts = (): HTMLScriptElement[] =>
  Array.from(
    document.head.querySelectorAll<HTMLScriptElement>('script[src*="maps.googleapis.com"]'),
  );

const scriptAt = (index: number): HTMLScriptElement => {
  const script = findScripts()[index];
  if (!script) throw new Error(`Script ${index} was not appended`);
  return script;
};

const fireLoad = (script: HTMLScriptElement): void => {
  script.dispatchEvent(new Event('load'));
};

const fireError = (script: HTMLScriptElement): void => {
  script.dispatchEvent(new Event('error'));
};

const clearGoogle = (): void => {
  Reflect.deleteProperty(globalThis, 'google');
};

describe('GoogleMapsLoader', () => {
  let importLibrary: ReturnType<typeof vi.fn>;
  let loader: GoogleMapsLoader;

  const exposeGoogle = (): void => {
    Reflect.set(globalThis, 'google', { maps: { importLibrary } });
  };

  beforeEach(() => {
    importLibrary = vi.fn().mockResolvedValue({});
    findScripts().forEach((script) => script.remove());
    clearGoogle();
    TestBed.configureTestingModule({});
    loader = TestBed.inject(GoogleMapsLoader);
  });

  afterEach(() => {
    findScripts().forEach((script) => script.remove());
    clearGoogle();
  });

  it('skips the script when google maps is already available', async () => {
    exposeGoogle();

    await loader.load();

    expect(findScripts()).toHaveLength(0);
  });

  it('imports core, maps, marker and geocoding libraries', async () => {
    exposeGoogle();

    await loader.load();

    expect(importLibrary).toHaveBeenCalledTimes(4);
    ['core', 'maps', 'marker', 'geocoding'].forEach((name) =>
      expect(importLibrary).toHaveBeenCalledWith(name),
    );
  });

  it('appends one script with key, async loading and region', async () => {
    const pending = loader.load();
    const script = scriptAt(0);

    expect(findScripts()).toHaveLength(1);
    expect(script.src).toContain(`key=${environment.googleMapsApiKey}`);
    expect(script.src).toContain('loading=async');
    expect(script.src).toContain('region=EG');

    exposeGoogle();
    fireLoad(script);
    await pending;
  });

  it('shares a single script between concurrent calls', async () => {
    const first = loader.load();
    const second = loader.load();

    exposeGoogle();
    fireLoad(scriptAt(0));
    await Promise.all([first, second]);

    expect(first).toBe(second);
    expect(findScripts()).toHaveLength(1);
  });

  it('rejects when the script fails to load', async () => {
    const pending = loader.load();

    fireError(scriptAt(0));

    await expect(pending).rejects.toThrow('Failed to load Google Maps');
  });

  it('allows a retry after a failure', async () => {
    const failed = loader.load();
    fireError(scriptAt(0));
    await expect(failed).rejects.toThrow();

    const retry = loader.load();
    expect(findScripts()).toHaveLength(2);

    exposeGoogle();
    fireLoad(scriptAt(1));
    await expect(retry).resolves.toBeUndefined();
  });
});
