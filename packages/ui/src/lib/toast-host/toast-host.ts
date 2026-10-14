import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '@org/auth-service';
import { Alert } from '../alert/alert';

@Component({
  selector: 'app-toast-host',
  imports: [Alert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      dir="ltr"
      style="position: fixed; bottom: 16px; left: 16px; right: auto; z-index: 9999;"
      class="pointer-events-none flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
    >
      @for (toast of notifications.toasts(); track toast.id) {
        <div class="pointer-events-auto shadow-lg">
          <app-alert
            [message]="toast.message"
            [severity]="toast.severity"
            [closable]="true"
            (dismissed)="notifications.dismiss(toast.id)"
          />
        </div>
      }
    </div>
  `,
})
export class ToastHost {
  protected readonly notifications = inject(NotificationService);
}
