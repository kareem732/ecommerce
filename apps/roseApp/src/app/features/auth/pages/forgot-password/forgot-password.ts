import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NotificationService, PasswordResetService } from '@org/auth-service';
import { Button, Input } from '@org/ui';
import { Observable, finalize, timer } from 'rxjs';
import { BackButton } from '../../components/back-button/back-button';
import { Stepper } from '../../components/stepper/stepper';
import { AuthRoute } from '../../enums/auth-route.enum';
import {
  ForgotPasswordForm,
  ResetPasswordForm,
} from '../../interfaces/forgot-password-form.interface';
import { STRONG_PASSWORD, fieldsMatch } from '../../utils/auth-validators';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    BackButton,
    Button,
    Input,
    Stepper,
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPassword {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly passwordReset = inject(PasswordResetService);
  private readonly notifications = inject(NotificationService);

  protected readonly Route = AuthRoute;
  protected readonly Step = { Email: 1, Sent: 2, Reset: 3 } as const;
  protected readonly parent = this.route.parent ?? undefined;

  protected readonly step = signal<number>(this.Step.Email);
  protected readonly loading = signal(false);
  protected readonly savedEmail = signal('');
  protected readonly resetToken = signal<string | null>(null);
  protected readonly resetSuccess = signal(false);

  protected readonly emailForm = this.fb.group<ForgotPasswordForm>({
    email: this.fb.control('', [Validators.required, Validators.email]),
  });

  protected readonly resetForm = this.fb.group<ResetPasswordForm>(
    {
      newPassword: this.fb.control('', [Validators.required, Validators.pattern(STRONG_PASSWORD)]),
      confirmPassword: this.fb.control('', Validators.required),
    },
    { validators: fieldsMatch('newPassword', 'confirmPassword') },
  );

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const token = params.get('token');
      if (token) {
        this.resetToken.set(token);
        this.step.set(this.Step.Reset);
      }
    });
  }

  protected errorOf(control: AbstractControl | null, patternKey = 'PATTERN'): string {
    if (!control?.touched) return '';
    const key = control.hasError('required')
      ? 'REQUIRED'
      : control.hasError('email')
        ? 'EMAIL'
        : control.hasError('pattern')
          ? patternKey
          : null;
    return key ? this.translate.instant(`AUTH.FORGOT.ERRORS.${key}`) : '';
  }

  protected confirmError(): string {
    const control = this.resetForm.controls.confirmPassword;
    if (!control.touched) return '';
    if (control.hasError('required')) {
      return this.translate.instant('AUTH.FORGOT.ERRORS.REQUIRED');
    }
    return this.resetForm.hasError('mismatch')
      ? this.translate.instant('AUTH.FORGOT.ERRORS.MISMATCH')
      : '';
  }

  // Step 1: email -> send reset link
  protected submitEmail(): void {
    if (this.emailForm.invalid) return this.emailForm.markAllAsTouched();

    const email = this.emailForm.getRawValue().email.trim();

    this.run(this.passwordReset.forgotPassword(email, this.resetUrl()), () => {
      this.savedEmail.set(email);
      this.step.set(this.Step.Sent);
    });
  }

  // Step 3: new password
  protected submitReset(): void {
    if (this.resetForm.invalid) return this.resetForm.markAllAsTouched();

    const token = this.resetToken();
    if (!token) {
      this.notifications.error(this.translate.instant('AUTH.FORGOT.INVALID_LINK'));
      return;
    }

    const { newPassword, confirmPassword } = this.resetForm.getRawValue();

    this.run(this.passwordReset.resetPassword({ token, newPassword, confirmPassword }), () => {
      this.resetSuccess.set(true);
      timer(1000)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          void this.router.navigate([AuthRoute.Login], { relativeTo: this.parent });
        });
    });
  }

  protected backToEmail(): void {
    this.step.set(this.Step.Email);
  }

  private resetUrl(): string {
    const tree = this.router.createUrlTree([AuthRoute.ForgotPassword], {
      relativeTo: this.parent,
    });
    return `${this.document.location.origin}${this.router.serializeUrl(tree)}`;
  }

  private run<T>(request$: Observable<T>, onSuccess?: () => void): void {
    this.loading.set(true);

    request$
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => onSuccess?.(),
      });
  }
}
