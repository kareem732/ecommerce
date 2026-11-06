import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, X } from 'lucide-angular';
import { LanguageService } from '@org/shared-i18n';
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
  private readonly language = inject(LanguageService);

  protected readonly X = X;

  protected readonly dir = computed(() => (this.language.isRTL() ? 'rtl' : 'ltr'));

  protected close(result: boolean): void {
    this.dialogRef.close(result);
  }
}
