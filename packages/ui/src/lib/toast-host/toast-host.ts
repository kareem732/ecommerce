import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService, ToastSeverity } from '@org/auth-service';

interface ToastStyle {
  container: string;
  icon: string;
}
const STYLES: Record<ToastSeverity, ToastStyle> = {
  success: {
    container:
      'bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-600 dark:text-emerald-100',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  error: {
    container:
      'bg-red-50 border-red-500 text-red-900 dark:bg-red-950 dark:border-red-600 dark:text-red-100',
    icon: 'text-red-600 dark:text-red-400',
  },
  info: {
    container:
      'bg-sky-50 border-sky-500 text-sky-900 dark:bg-sky-950 dark:border-sky-600 dark:text-sky-100',
    icon: 'text-sky-600 dark:text-sky-400',
  },
};

@Component({
  selector: 'app-toast-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      dir="ltr"
      aria-live="polite"
      class="pointer-events-none fixed right-4 bottom-4 z-9999 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
    >
      @for (toast of notifications.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all duration-200 ease-out starting:translate-x-6 starting:opacity-0 {{
            styleOf(toast.severity).container
          }}"
          [attr.role]="toast.severity === 'error' ? 'alert' : 'status'"
        >
          <span
            class="mt-0.5 shrink-0 {{ styleOf(toast.severity).icon }}"
            aria-hidden="true"
          >
            @switch (toast.severity) {
              @case ('success') {
                <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m8 12 3 3 5-6" />
                </svg>
              }
              @case ('error') {
                <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v5" />
                  <path d="M12 16h.01" />
                </svg>
              }
              @default {
                <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 11v5" />
                  <path d="M12 8h.01" />
                </svg>
              }
            }
          </span>

          <p dir="auto" class="min-w-0 flex-1 text-sm font-medium wrap-break-word">
            {{ toast.message }}
          </p>

          <button
            type="button"
            class="shrink-0 cursor-pointer rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
            aria-label="Close"
            (click)="notifications.dismiss(toast.id)"
          >
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastHost {
  protected readonly notifications = inject(NotificationService);

  protected styleOf(severity: ToastSeverity): ToastStyle {
    return STYLES[severity];
  }
}
