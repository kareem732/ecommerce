import { inject, Injectable } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { firstValueFrom } from 'rxjs';
import { ConfirmationDialog } from '../ui/confirmation-dialog/confirmation-dialog';
import { ConfirmationDialogData } from '../ui/confirmation-dialog/confirmation-dialog.model';

export interface ConfirmOptions {
  lockScroll?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmationDialogService {
  private readonly dialog = inject(Dialog);
  private readonly overlay = inject(Overlay);

  async confirm(
    data: ConfirmationDialogData,
    { lockScroll = true }: ConfirmOptions = {},
  ): Promise<boolean> {
    const ref = this.dialog.open<boolean, ConfirmationDialogData>(
      ConfirmationDialog,
      {
        data: {
          confirmText: 'COMMON.CONFIRM',
          cancelText: 'COMMON.CANCEL',
          variant: 'danger',
          ...data,
        },
        backdropClass: 'app-dialog-backdrop',
        autoFocus: false,
        disableClose: true,
        scrollStrategy: lockScroll
          ? this.overlay.scrollStrategies.block()
          : this.overlay.scrollStrategies.noop(),
      },
    );

    return (await firstValueFrom(ref.closed)) ?? false;
  }
}
