import { Injectable, signal } from '@angular/core';

export type ToastSeverity = 'error' | 'success' | 'info';

export interface Toast {
  id: number;
  message: string;
  severity: ToastSeverity;
  params?: Record<string, unknown>;
}

const MAX_VISIBLE = 3;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 0;
  private readonly _toasts = signal<Toast[]>([]);

  readonly toasts = this._toasts.asReadonly();

  show(
    message: string,
    severity: ToastSeverity = 'error',
    duration = 5000,
    params?: Record<string, unknown>,
  ): void {
    if (
      this._toasts().some(
        (t) =>
          t.message === message &&
          JSON.stringify(t.params) === JSON.stringify(params),
      )
    ) {
      return;
    }

    const id = this.nextId++;
    this._toasts.update((list) => [
      ...list.slice(-(MAX_VISIBLE - 1)),
      { id, message, severity, params },
    ]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  error(message: string, params?: Record<string, unknown>): void {
    this.show(message, 'error', 5000, params);
  }

  success(message: string, params?: Record<string, unknown>): void {
    this.show(message, 'success', 5000, params);
  }

  info(message: string, params?: Record<string, unknown>): void {
    this.show(message, 'info', 5000, params);
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
