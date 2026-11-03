import { inject, Injectable } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { firstValueFrom } from 'rxjs';
import { ConfirmationDialog } from '../ui/confirmation-dialog/confirmation-dialog';
import { ConfirmationDialogData } from '../ui/confirmation-dialog/confirmation-dialog.model';

@Injectable({ providedIn: 'root' })
export class ConfirmationDialogService {
  private readonly dialog = inject(Dialog);

  async confirm(data: ConfirmationDialogData): Promise<boolean> {
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
      },
    );

    return (await firstValueFrom(ref.closed)) ?? false;
  }
}
