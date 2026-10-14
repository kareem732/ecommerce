import { Injectable, signal } from '@angular/core';

export type ToastSeverity = 'error' | 'success' | 'info';

export interface Toast {
  id: number;
  message: string;
  severity: ToastSeverity;
}

const MAX_VISIBLE = 3;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 0;
  private readonly _toasts = signal<Toast[]>([]);

  readonly toasts = this._toasts.asReadonly();

  show(message: string, severity: ToastSeverity = 'error', duration = 5000): void {
    if (this._toasts().some((t) => t.message === message)) return;

    const id = this.nextId++;
    this._toasts.update((list) => [...list.slice(-(MAX_VISIBLE - 1)), { id, message, severity }]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
