import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, X } from 'lucide-angular';
import { ConfirmationDialogData } from './confirmation-dialog.model';

@Component({
  selector: 'app-confirmation-dialog',
  imports: [TranslatePipe, LucideAngularModule],
  templateUrl: './confirmation-dialog.html',
  styleUrl: './confirmation-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialog {
  protected readonly data = inject<ConfirmationDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);

  protected readonly X = X;

  protected close(result: boolean): void {
    this.dialogRef.close(result);
  }
}
