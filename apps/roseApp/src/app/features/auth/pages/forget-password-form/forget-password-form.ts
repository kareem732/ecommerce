import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Input } from '../../../../shared/ui/input/input';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Button } from '../../../../shared/ui/button/button';
import {
  AuthApiService,
  ForgotPasswordRequest,
} from '@org/auth-service';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-forget-password-form',
  imports: [Input, ReactiveFormsModule, Button],
  templateUrl: './forget-password-form.html',
  styleUrl: './forget-password-form.scss',
})
export class ForgetPasswordForm {
  private readonly authApi = inject(AuthApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  forgetPasswordForm = new FormGroup({
    email: new FormControl('', {nonNullable: true,
  validators: [Validators.required, Validators.email],} 
    ),
  });
  
get emailError(): string {
  const emailControl = this.forgetPasswordForm.controls.email;

  if (!emailControl.touched) {
    return '';
  }

  if (emailControl.hasError('required')) {
    return 'Email is required';
  }

  if (emailControl.hasError('email')) {
    return 'Please enter a valid email address';
  }
  return '';
}
onSubmit():void{
this.forgetPasswordForm.markAllAsTouched();
  if (this.forgetPasswordForm.invalid) {
    return;
  }
  const email = this.forgetPasswordForm.controls.email.value?.trim();
  const body :ForgotPasswordRequest = {
    email,
    redirectUrl: `${window.location.origin}/roseApp/auth/reset-password`,
  }
  this.authApi.forgotPassword(body).subscribe({
      next: (message) => {
     this.messageService.add({ severity: 'success',
    summary: 'Success',
    detail: message || 'A password reset link has been sent to your email.',
    life: 3000,
    });
    this.router.navigate(['../reset-link-received'], {
      relativeTo: this.route,
      state: { email },
    });},
  error: (error) => {
      const response = error?.error ?? error;

      const errorMessage =
    response?.errors?.[0]?.message ||
    response?.message ||
    'Something went wrong. Please try again.';

this.messageService.add({
    severity: 'error',
    summary: 'Error',
    detail:errorMessage,
    life: 4000,
  });    }
  })
}

}
