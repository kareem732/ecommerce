import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { AUTH_CONFIG } from '../config/auth.config';
import { TokenPayload } from '../models/token.model';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly doc = inject(DOCUMENT);
  private readonly name = inject(AUTH_CONFIG).tokenCookieName;

  getToken(): string | null {
    const prefix = `${this.name}=`;
    const entry = this.doc.cookie.split('; ').find((c) => c.startsWith(prefix));
    return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
  }

  setToken(token: string): void {
    const payload = this.decode(token);
    const expires = payload ? `; expires=${new Date(payload.exp * 1000).toUTCString()}` : '';
    const secure = this.doc.location?.protocol === 'https:' ? '; Secure' : '';
    this.doc.cookie = `${this.name}=${encodeURIComponent(token)}${expires}; path=/; SameSite=Strict${secure}`;
  }

  clear(): void {
    this.doc.cookie = `${this.name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict`;
  }

  getPayload(token: string | null = this.getToken()): TokenPayload | null {
    return token ? this.decode(token) : null;
  }

  isExpired(token: string | null | undefined = this.getToken()): boolean {
    if (!token) return true;
    const payload = this.decode(token);
    return !payload || payload.exp * 1000 <= Date.now();
  }

  hasValidToken(): boolean {
    return !this.isExpired();
  }

  private decode(token: string): TokenPayload | null {
    try {
      const part = token.split('.')[1];
      if (!part) return null;
      const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      const payload = JSON.parse(atob(padded)) as TokenPayload;
      return typeof payload.exp === 'number' ? payload : null;
    } catch {
      return null;
    }
  }
}
