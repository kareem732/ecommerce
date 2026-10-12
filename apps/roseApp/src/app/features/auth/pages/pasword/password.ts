import { Component, inject, signal, WritableSignal } from '@angular/core';
import { Stepper } from '../../../../shared/ui/stepper/stepper';
import { Button } from '../../../../shared/ui/button/button';
import { Input } from '../../../../shared/ui/input/input';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterData } from '../../services/register-data/register-data';
import { AuthService } from '../../services/authService/auth-service';
import { Router } from '@angular/router';
import { Alert } from '../../../../shared/ui/alert/alert';

@Component({
  selector: 'app-password',
  imports: [Stepper, Button, Input, ReactiveFormsModule, Alert],
  templateUrl: './password.html',
  styleUrl: './password.scss',
})
export class Password {
  private readonly registerData = inject(RegisterData)
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router)

  errorMsg: WritableSignal<string> = signal('')
  successMsg: WritableSignal<string> = signal('')

  passwordForm: FormGroup = new FormGroup({
    password: new FormControl(null, [Validators.required]),
    confirmPassword: new FormControl(null, [Validators.required])
  }, { validators: this.confirmPassword })


  //make a function (Parameter:data type)
  confirmPassword(group: any) {
    //1- emsek password value
    let PasswordValue = group.get('password').value

    //2- emsek confirm password value
    let confirmPasswordValue = group.get('confirmPassword').value

    //3-condition
    if (PasswordValue == confirmPasswordValue) {
      return null;
    }
    else {
      return { mismatch: true }
    }
  }

  createAccount() {
    if (this.passwordForm.valid) {
      //Get All Data
      const allRegisterData = {
        ...this.registerData.registerData,
        password: this.passwordForm.getRawValue().password,
        confirmPassword: this.passwordForm.getRawValue().confirmPassword
      };
      this.authService.register(allRegisterData).subscribe({
        next: (res) => {
          console.log(res);
          // 0- Hide Error msg
          this.errorMsg.set('');

          // 1- Show Success Msg
          this.successMsg.set(res.message);

          // 2- Navigate To Register login
          setTimeout(() => {
            this.router.navigate(['/roseApp/auth/login'], {
            });
          }, 3000);

        },
        error: (err) => {
          console.log(err);
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

}
