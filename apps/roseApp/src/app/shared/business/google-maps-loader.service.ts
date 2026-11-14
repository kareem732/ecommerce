import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

const MAPS_SCRIPT_URL = 'https://maps.googleapis.com/maps/api/js';

@Injectable({ providedIn: 'root' })
export class GoogleMapsLoader {
  private readonly document = inject(DOCUMENT);
  private pending: Promise<void> | null = null;

  load(): Promise<void> {
    this.pending ??= this.loadScript()
      .then(() => this.importLibraries())
      .catch((error: unknown) => {
        this.pending = null;
        throw error;
      });
    return this.pending;
  }

  private loadScript(): Promise<void> {
    if (typeof google !== 'undefined' && typeof google.maps?.importLibrary === 'function') {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const script = this.document.createElement('script');
      script.src = `${MAPS_SCRIPT_URL}?key=${environment.googleMapsApiKey}&loading=async&region=EG`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps'));
      this.document.head.appendChild(script);
    });
  }

  private async importLibraries(): Promise<void> {
    await Promise.all([
      google.maps.importLibrary('core'),
      google.maps.importLibrary('maps'),
      google.maps.importLibrary('marker'),
    ]);
  }
}
