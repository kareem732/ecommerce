import { Component, inject } from '@angular/core';
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
  const body :ForgotPasswordRequest = {
    email:this.forgetPasswordForm.controls.email.value?.trim(),
    redirectUrl: `${window.location.origin}/roseApp/auth/reset-password`,
  }
  this.authApi.forgotPassword(body).subscribe({
      next: (message) => {
     this.messageService.add({ severity: 'success',
    summary: 'Success',
    detail: message || 'Password recovery instructions have been requested.',
    life: 3000,
    })}, 
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
