import { Component, inject, signal, WritableSignal } from '@angular/core';
import { AuthService } from '../../services/authService/auth-service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Alert } from '../../../../shared/ui/alert/alert';
import { Stepper } from '../../../../shared/ui/stepper/stepper';
import { RegisterData } from '../../services/register-data/register-data';


@Component({
  selector: 'app-otp',
  imports: [Alert, ReactiveFormsModule, RouterLink, Stepper],
  templateUrl: './otp.html',
  styleUrl: './otp.scss',
})
export class otp {
  private readonly authService = inject(AuthService)
  private readonly registerData = inject(RegisterData);
  private readonly router = inject(Router)

  errorMsg: WritableSignal<string> = signal('')
  successMsg: WritableSignal<string> = signal('')

  email = ''
  constructor(private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

  codeForm = new FormGroup({
    code: new FormArray(
      Array.from({ length: 6 }, () =>
        new FormControl('', {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.maxLength(1),
            Validators.pattern(/^[0-9]$/)
          ]
        })
      )
    )
  });

  get codeControls(): FormArray<FormControl<string>> {
    return this.codeForm.controls.code as FormArray<FormControl<string>>;
  }

  verifyButton() {
    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      return;
    }

    const code = this.codeControls.controls
      .map(control => control.value)
      .join('');

    const payload = {
      email: this.email,
      code: code
    };

    this.authService.otpCode(payload).subscribe({
      next: (res) => {
        // 0- Hide Error msg
        this.errorMsg.set('');

        // 1- Show Success Msg
        this.successMsg.set(res.message);

        // Store Email
        this.registerData.registerData = {
          ...this.registerData.registerData,
          email: this.email
        };

        // 2- Navigate To Register Info
        setTimeout(() => {
          this.router.navigate(['/roseApp/auth/user-info'], {
          });
        }, 3000);
      },
      error: (err) => {
        // 0- Hide Success Msg
        this.successMsg.set('');

        // 1- Show Error Msg
        this.errorMsg.set(
          err.error?.message || 'Verification failed. Please try again.'
        );
      }
    });
  }
}
