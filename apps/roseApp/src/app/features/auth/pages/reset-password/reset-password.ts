import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Button, Input } from '@org/ui';
import { BackButton } from '../../components/back-button/back-button';
import { AuthRoute } from '../../enums/auth-route.enum';
import { ResetPasswordForm } from '../../interfaces/reset-password-form.interface';
import { ResetPasswordStore } from '../../stores/reset-password.store';
import { STRONG_PASSWORD, fieldsMatch } from '../../utils/auth-validators';
import { FormErrorService } from '../../utils/form-error.service';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, BackButton, Button, Input],
  providers: [ResetPasswordStore, FormErrorService],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPassword {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(ResetPasswordStore);
  private readonly errors = inject(FormErrorService).scope('AUTH.RESET.ERRORS');

  protected readonly Route = AuthRoute;
  protected readonly parent = this.route.parent ?? undefined;
  protected readonly token = this.route.snapshot.queryParamMap.get('token');
  protected readonly loading = this.store.loading;
  protected readonly done = this.store.succeeded;

  protected readonly form = this.fb.group<ResetPasswordForm>(
    {
      newPassword: this.fb.control('', [Validators.required, Validators.pattern(STRONG_PASSWORD)]),
      confirmPassword: this.fb.control('', Validators.required),
    },
    { validators: fieldsMatch('newPassword', 'confirmPassword') },
  );

  protected passwordError(): string {
    return this.errors.of(this.form.controls.newPassword, 'PASSWORD');
  }

  protected confirmError(): string {
    return this.errors.confirm(this.form, this.form.controls.confirmPassword);
  }

  protected submit(): void {
    if (!this.token) return;
    if (this.form.invalid) return this.form.markAllAsTouched();

    const { newPassword, confirmPassword } = this.form.getRawValue();
    this.store.resetPassword({ token: this.token, newPassword, confirmPassword });
  }
}
