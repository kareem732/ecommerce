import { Injectable, signal } from '@angular/core';

export type ToastSeverity = 'error' | 'success' | 'info';

export interface Toast {
  id: number;
  message: string;
  severity: ToastSeverity;
  params?: Record<string, unknown>;
  duration: number;
  count: number;
  version: number;
}

const MAX_VISIBLE = 3;

const DEFAULT_DURATION: Record<ToastSeverity, number> = {
  success: 3500,
  info: 4500,
  error: 6000,
};

interface TimerState {
  handle: ReturnType<typeof setTimeout> | null;
  startedAt: number;
  remaining: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 0;
  private readonly _toasts = signal<Toast[]>([]);
  private readonly timers = new Map<number, TimerState>();

  readonly toasts = this._toasts.asReadonly();

  show(
    message: string,
    severity: ToastSeverity = 'error',
    duration: number = DEFAULT_DURATION[severity],
    params?: Record<string, unknown>,
  ): void {
    const paramsKey = JSON.stringify(params ?? null);

    const existing = this._toasts().find(
      (t) =>
        t.message === message &&
        t.severity === severity &&
        JSON.stringify(t.params ?? null) === paramsKey,
    );

    if (existing) {
      this._toasts.update((list) =>
        list.map((t) =>
          t.id === existing.id
            ? { ...t, count: t.count + 1, version: t.version + 1 }
            : t,
        ),
      );
      this.schedule(existing.id, existing.duration);
      return;
    }

    const id = this.nextId++;
    const toast: Toast = {
      id,
      message,
      severity,
      params,
      duration,
      count: 1,
      version: 0,
    };

    const current = this._toasts();
    const overflow = Math.max(current.length - (MAX_VISIBLE - 1), 0);
    current.slice(0, overflow).forEach((t) => this.cancel(t.id));
    this._toasts.set([...current.slice(overflow), toast]);

    this.schedule(id, duration);
  }

  error(message: string, params?: Record<string, unknown>): void {
    this.show(message, 'error', undefined, params);
  }

  success(message: string, params?: Record<string, unknown>): void {
    this.show(message, 'success', undefined, params);
  }

  info(message: string, params?: Record<string, unknown>): void {
    this.show(message, 'info', undefined, params);
  }

  dismiss(id: number): void {
    this.cancel(id);
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  clear(): void {
    this.timers.forEach((_, id) => this.cancel(id));
    this._toasts.set([]);
  }

  pause(id: number): void {
    const state = this.timers.get(id);
    if (!state?.handle) return;

    clearTimeout(state.handle);
    state.handle = null;
    state.remaining = Math.max(
      state.remaining - (Date.now() - state.startedAt),
      0,
    );
  }

  resume(id: number): void {
    const state = this.timers.get(id);
    if (!state || state.handle) return;

    this.schedule(id, state.remaining > 0 ? state.remaining : 1);
  }

  private schedule(id: number, ms: number): void {
    this.cancel(id);
    if (ms <= 0) return;

    this.timers.set(id, {
      handle: setTimeout(() => this.dismiss(id), ms),
      startedAt: Date.now(),
      remaining: ms,
    });
  }

  private cancel(id: number): void {
    const state = this.timers.get(id);
    if (state?.handle) clearTimeout(state.handle);
    this.timers.delete(id);
  }
}
