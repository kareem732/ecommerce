import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Input } from '../../../../shared/ui/input/input';
import { Button } from '../../../../shared/ui/button/button';
import {
  AuthApiService,
  AuthError,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@org/auth-service';
import { MessageService } from 'primeng/api';

type Step = 'email' | 'sent' | 'reset';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-forget-password-form',
  imports: [Input, Button, ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './forget-password-form.html',
  styleUrl: './forget-password-form.scss',
})
export class ForgetPasswordForm {
  private readonly authApi = inject(AuthApiService);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';

  readonly step = signal<Step>(this.token ? 'reset' : 'email');
  readonly email = signal('');
  readonly loading = signal(false);

  readonly emailForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  readonly passwordForm = new FormGroup(
    {
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: passwordsMatch },
  );

  get emailError(): string {
    const control = this.emailForm.controls.email;
    if (!control.touched) {
      return '';
    }
    if (control.hasError('required')) {
      return this.translate.instant('AUTH.FORGET_PASSWORD.EMAIL_REQUIRED');
    }
    if (control.hasError('email')) {
      return this.translate.instant('AUTH.FORGET_PASSWORD.EMAIL_INVALID');
    }
    return '';
  }

  get passwordError(): string {
    const control = this.passwordForm.controls.password;
    if (!control.touched) {
      return '';
    }
    if (control.hasError('required')) {
      return this.translate.instant('AUTH.RESET_PASSWORD.PASSWORD_REQUIRED');
    }
    if (control.hasError('minlength')) {
      return this.translate.instant('AUTH.RESET_PASSWORD.PASSWORD_MIN');
    }
    return '';
  }

  get confirmPasswordError(): string {
    const control = this.passwordForm.controls.confirmPassword;
    if (!control.touched) {
      return '';
    }
    if (control.hasError('required')) {
      return this.translate.instant('AUTH.RESET_PASSWORD.CONFIRM_REQUIRED');
    }
    if (this.passwordForm.hasError('passwordMismatch')) {
      return this.translate.instant('AUTH.RESET_PASSWORD.MISMATCH');
    }
    return '';
  }

  backToEmail(): void {
    this.step.set('email');
  }

  submitEmail(): void {
    this.emailForm.markAllAsTouched();
    if (this.emailForm.invalid) {
      return;
    }

    const email = this.emailForm.controls.email.value.trim();
    const body: ForgotPasswordRequest = {
      email,
      redirectUrl: `${window.location.origin}/roseApp/auth/forget-password`,
    };

    this.loading.set(true);
    this.authApi
      .forgotPassword(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (message) => {
          this.loading.set(false);
          this.email.set(email);
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('AUTH.FORGET_PASSWORD.SUCCESS_TITLE'),
            detail:
              message ||
              this.translate.instant('AUTH.FORGET_PASSWORD.SUCCESS_DETAIL'),
            life: 3000,
          });
          this.step.set('sent');
        },
        error: (error: AuthError) => {
          this.loading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('AUTH.FORGET_PASSWORD.ERROR_TITLE'),
            detail: error.message,
            life: 4000,
          });
        },
      });
  }

  submitReset(): void {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid) {
      return;
    }

    const body: ResetPasswordRequest = {
      token: this.token,
      newPassword: this.passwordForm.controls.password.value,
      confirmPassword: this.passwordForm.controls.confirmPassword.value,
    };

    this.loading.set(true);
    this.authApi
      .resetPassword(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (message) => {
          this.loading.set(false);
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('AUTH.RESET_PASSWORD.SUCCESS_TITLE'),
            detail:
              message ||
              this.translate.instant('AUTH.RESET_PASSWORD.SUCCESS_DETAIL'),
            life: 3000,
          });
          setTimeout(() => this.router.navigate(['/']), 1500);
        },
        error: (error: AuthError) => {
          this.loading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('AUTH.RESET_PASSWORD.ERROR_TITLE'),
            detail: error.message,
            life: 4000,
          });
        },
      });
  }
}
