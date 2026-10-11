import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Input } from '../../../../shared/ui/input/input';
import { Button } from '../../../../shared/ui/button/button';
import { AuthApiService, ResetPasswordRequest } from '@org/auth-service';
import { MessageService } from 'primeng/api';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-reset-password-form',
  imports: [Input, Button, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password-form.html',
  styleUrl: './reset-password-form.scss',
})
export class ResetPasswordForm {
  private readonly authApi = inject(AuthApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';
  readonly loading = signal(false);

  resetPasswordForm = new FormGroup(
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

  get passwordError(): string {
    const control = this.resetPasswordForm.controls.password;
    if (!control.touched) {
      return '';
    }
    if (control.hasError('required')) {
      return 'Password is required';
    }
    if (control.hasError('minlength')) {
      return 'Password must be at least 8 characters';
    }
    return '';
  }

  get confirmPasswordError(): string {
    const control = this.resetPasswordForm.controls.confirmPassword;
    if (!control.touched) {
      return '';
    }
    if (control.hasError('required')) {
      return 'Please confirm your password';
    }
    if (this.resetPasswordForm.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }

  onSubmit(): void {
    this.resetPasswordForm.markAllAsTouched();
    if (this.resetPasswordForm.invalid) {
      return;
    }

    const body: ResetPasswordRequest = {
      token: this.token,
      newPassword: this.resetPasswordForm.controls.password.value,
      confirmPassword: this.resetPasswordForm.controls.confirmPassword.value,
    };

    this.loading.set(true);
    this.authApi.resetPassword(body).subscribe({
      next: (message) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: message || 'Your password has been successfully reset.',
          life: 3000,
        });
        setTimeout(() => this.router.navigate(['/']), 1500);
      },
      error: (error) => {
        this.loading.set(false);
        const response = error?.error ?? error;
        const errorMessage =
          response?.errors?.[0]?.message ||
          response?.message ||
          'Something went wrong. Please try again.';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
          life: 4000,
        });
      },
    });
  }
}
