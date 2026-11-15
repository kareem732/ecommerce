import { DatePipe } from '@angular/common';
import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  OverlayModule,
} from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Pagination } from '@org/ui';
import {
  AlertCircle,
  BellOff,
  Check,
  CheckCheck,
  LucideAngularModule,
  MoreVertical,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-angular';
import { ConfirmationDialogService } from '../../shared/business/confirmation-dialog.service';
import { NotificationItem } from './notifications.models';
import { NotificationsStore } from './notifications.store';

@Component({
  selector: 'app-notifications-panel',
  standalone: true,
  imports: [
    DatePipe,
    OverlayModule,
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    TranslatePipe,
    LucideAngularModule,
    Pagination,
  ],
  templateUrl: './notifications-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsPanel {
  protected readonly store = inject(NotificationsStore);
  private readonly confirmationService = inject(ConfirmationDialogService);
  private readonly router = inject(Router);

  readonly close = output<void>();

  readonly activeMenuId = signal<string | null>(null);
  readonly activeOrigin = signal<CdkOverlayOrigin | null>(null);
  readonly triggerElement = signal<HTMLElement | null>(null);

  readonly activeItem = computed(() =>
    this.store.items().find((item) => item.id === this.activeMenuId()) ?? null,
  );

  readonly BellOff = BellOff;
  readonly Check = Check;
  readonly CheckCheck = CheckCheck;
  readonly MoreVertical = MoreVertical;
  readonly RotateCcw = RotateCcw;
  readonly Trash2 = Trash2;
  readonly X = X;
  readonly AlertCircle = AlertCircle;

  openMenu(
    id: string,
    origin: CdkOverlayOrigin,
    triggerEl: HTMLElement,
  ): void {
    if (this.activeMenuId() === id) {
      this.closeMenu();
      return;
    }
    this.activeMenuId.set(id);
    this.activeOrigin.set(origin);
    this.triggerElement.set(triggerEl);
  }

  closeMenu(): void {
    const trigger = this.triggerElement();
    this.activeMenuId.set(null);
    this.activeOrigin.set(null);
    this.triggerElement.set(null);
    if (trigger) {
      trigger.focus();
    }
  }

  onMarkRead(id: string): void {
    this.closeMenu();
    this.store.markRead(id);
  }

  onDelete(id: string): void {
    this.closeMenu();
    this.store.delete(id);
  }

  onMarkAllRead(): void {
    this.store.markAllRead();
  }

  async onClearAll(): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      message: 'NOTIFICATIONS.CONFIRM_CLEAR_MESSAGE',
      confirmText: 'NOTIFICATIONS.CLEAR_ALL',
      variant: 'danger',
    });
    if (confirmed) {
      this.store.clearAll();
    }
  }

  onPageChange(page: number): void {
    this.store.loadPage(page);
  }

  onItemClick(item: NotificationItem): void {
    if (!item.isRead) {
      this.store.markRead(item.id);
    }
    if (item.link) {
      this.close.emit();
      void this.router.navigateByUrl(item.link);
    }
  }
}
