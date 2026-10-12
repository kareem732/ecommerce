import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { Input } from '../../../../shared/ui/input/input';
import { Button } from '../../../../shared/ui/button/button';
import {
  AuthApiService,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@org/auth-service';
import { MessageService } from 'primeng/api';
import { ForgetPasswordStep, passwordsMatch } from '../../../../shared/utils/forget-password.utils';

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

  readonly step = signal<ForgetPasswordStep>(this.token ? 'reset' : 'email');
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
    { validators: passwordsMatch('password', 'confirmPassword') },
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
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.email.set(email);
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('AUTH.FORGET_PASSWORD.SUCCESS_TITLE'),
            detail: this.translate.instant('AUTH.FORGET_PASSWORD.SUCCESS_DETAIL'),
            life: 3000,
          });
          this.step.set('sent');
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
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('AUTH.RESET_PASSWORD.SUCCESS_TITLE'),
            detail: this.translate.instant('AUTH.RESET_PASSWORD.SUCCESS_DETAIL'),
            life: 3000,
          });
          setTimeout(() => this.router.navigate(['/']), 1500);
        },
      });
  }
}
