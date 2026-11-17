import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Button, Input } from '@org/ui';
import { STRONG_PASSWORD, fieldsMatch } from '../../../auth/utils/auth-validators';
import { FormErrorService } from '../../../auth/utils/form-error.service';
import { ChangePasswordForm } from '../../interfaces/change-password-form.interface';
import { ChangePasswordStore } from '../../stores/change-password.store';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule, TranslatePipe, Button, Input],
  providers: [ChangePasswordStore, FormErrorService],
  templateUrl: './change-password.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePassword {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(ChangePasswordStore);
  private readonly errors = inject(FormErrorService).scope('ACCOUNT.ERRORS');

  protected readonly loading = this.store.loading;

  protected readonly form = this.fb.group<ChangePasswordForm>(
    {
      currentPassword: this.fb.control('', Validators.required),
      newPassword: this.fb.control('', [Validators.required, Validators.pattern(STRONG_PASSWORD)]),
      confirmPassword: this.fb.control('', Validators.required),
    },
    { validators: fieldsMatch('newPassword', 'confirmPassword') },
  );

  constructor() {
    effect(() => {
      if (this.store.succeeded()) this.form.reset();
    });
  }

  protected currentPasswordError(): string {
    return this.errors.of(this.form.controls.currentPassword);
  }

  protected newPasswordError(): string {
    return this.errors.of(this.form.controls.newPassword, 'PASSWORD');
  }

  protected confirmPasswordError(): string {
    return this.errors.confirm(this.form, this.form.controls.confirmPassword);
  }

  protected submit(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.store.changePassword(this.form.getRawValue());
  }
}
