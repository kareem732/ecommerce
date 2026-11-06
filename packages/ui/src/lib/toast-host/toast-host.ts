import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService, ToastSeverity } from '@org/auth-service';
import {
  CircleAlert,
  CircleCheck,
  Info,
  LucideAngularModule,
  X,
} from 'lucide-angular';
import { merge, scan, startWith } from 'rxjs';

interface ToastStyle {
  container: string;
  icon: string;
  bar: string;
}

const STYLES: Record<ToastSeverity, ToastStyle> = {
  success: {
    container:
      'bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-600 dark:text-emerald-100',
    icon: 'text-emerald-600 dark:text-emerald-400',
    bar: 'bg-emerald-500',
  },
  error: {
    container:
      'bg-red-50 border-red-500 text-red-900 dark:bg-red-950 dark:border-red-600 dark:text-red-100',
    icon: 'text-red-600 dark:text-red-400',
    bar: 'bg-red-500',
  },
  info: {
    container:
      'bg-sky-50 border-sky-500 text-sky-900 dark:bg-sky-950 dark:border-sky-600 dark:text-sky-100',
    icon: 'text-sky-600 dark:text-sky-400',
    bar: 'bg-sky-500',
  },
};

const ICONS = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
} as const;

const BACKEND_MESSAGE_KEYS: Record<string, string> = {
  'item added to wishlist': 'WISHLIST.ADDED',
  'item removed from wishlist': 'WISHLIST.REMOVED',
  'wishlist cleared': 'WISHLIST.CLEARED',
  'item added to cart': 'SHOP.CART.ADDED',
  'item removed from cart': 'SHOP.CART.REMOVED',
  'cart cleared': 'SHOP.CART.CLEARED',
  'insufficient stock': 'ERRORS.INSUFFICIENT_STOCK',
};

const normalize = (message: string): string =>
  message.trim().toLowerCase().replace(/[.!\s]+$/, '');

@Component({
  selector: 'app-toast-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  styles: `
    @keyframes toast-progress {
      from {
        width: 100%;
      }
      to {
        width: 0;
      }
    }

    .toast__bar {
      animation-name: toast-progress;
      animation-timing-function: linear;
      animation-fill-mode: forwards;
    }

    @media (prefers-reduced-motion: reduce) {
      .toast__bar {
        display: none;
      }
    }
  `,
  template: `
    <div
      aria-live="polite"
      class="pointer-events-none fixed inset-x-4 bottom-4 z-9999 flex flex-col gap-2 md:inset-x-auto md:right-6 md:bottom-6 md:w-full md:max-w-sm"
    >
      @for (toast of notifications.toasts(); track toast.id) {
        <div
          class="group pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-xl border px-4 py-3 shadow-lg transition-all duration-200 ease-out starting:translate-y-2 starting:opacity-0 {{
            styleOf(toast.severity).container
          }}"
          [attr.role]="toast.severity === 'error' ? 'alert' : 'status'"
          (mouseenter)="notifications.pause(toast.id)"
          (mouseleave)="notifications.resume(toast.id)"
          (focusin)="notifications.pause(toast.id)"
          (focusout)="notifications.resume(toast.id)"
        >
          <lucide-icon
            [img]="iconOf(toast.severity)"
            [size]="20"
            class="mt-0.5 shrink-0 {{ styleOf(toast.severity).icon }}"
            aria-hidden="true"
          />

          <p dir="auto" class="min-w-0 flex-1 text-sm font-medium wrap-break-word">
            {{ text(toast) }}
          </p>

          @if (toast.count > 1) {
            <span
              class="shrink-0 rounded-full bg-black/10 px-1.5 py-0.5 text-xs leading-none font-bold dark:bg-white/15"
              aria-hidden="true"
            >
              ×{{ toast.count > 9 ? '9+' : toast.count }}
            </span>
          }

          <button
            type="button"
            class="shrink-0 cursor-pointer rounded p-0.5 opacity-60 transition-opacity hover:opacity-100 focus-visible:opacity-100"
            [attr.aria-label]="closeLabel()"
            (click)="notifications.dismiss(toast.id)"
          >
            <lucide-icon [img]="closeIcon" [size]="16" aria-hidden="true" />
          </button>

          @if (toast.duration > 0) {
            @for (version of [toast.version]; track version) {
              <span
                class="toast__bar absolute start-0 bottom-0 h-0.5 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] {{
                  styleOf(toast.severity).bar
                }}"
                [style.animation-duration.ms]="toast.duration"
                aria-hidden="true"
              ></span>
            }
          }
        </div>
      }
    </div>
  `,
})
export class ToastHost {
  protected readonly notifications = inject(NotificationService);
  private readonly translate = inject(TranslateService);

  protected readonly closeIcon = X;

  private readonly i18nTick = toSignal(
    merge(
      this.translate.onLangChange,
      this.translate.onTranslationChange,
    ).pipe(
      scan((count) => count + 1, 0),
      startWith(0),
    ),
    { initialValue: 0 },
  );

  protected styleOf(severity: ToastSeverity): ToastStyle {
    return STYLES[severity];
  }

  protected iconOf(severity: ToastSeverity) {
    return ICONS[severity];
  }

  protected text(toast: {
    message: string;
    params?: Record<string, unknown>;
  }): string {
    this.i18nTick();
    const key = BACKEND_MESSAGE_KEYS[normalize(toast.message)] ?? toast.message;
    return this.translate.instant(key, toast.params);
  }

  protected closeLabel(): string {
    this.i18nTick();
    return this.translate.instant('COMMON.CLOSE');
  }
}