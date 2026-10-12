import { Component, inject, signal, WritableSignal } from '@angular/core';
import { Input } from '../../../../shared/ui/input/input';
import { Button } from '../../../../shared/ui/button/button';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Alert } from '../../../../shared/ui/alert/alert';
import { AuthService } from '../../services/authService/auth-service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [Input, Button, ReactiveFormsModule, Alert, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly authService = inject(AuthService)
  private readonly router = inject(Router)

  errorMsg: WritableSignal<string> = signal('')
  successMsg: WritableSignal<string> = signal('')

  // Handel alert Message
  get email() {
    return this.emailForm.controls['email'];
  }

  emailForm:FormGroup = new FormGroup({
    email : new FormControl(null,[Validators.required,Validators.email])
  })

  emailButton(){
    if(this.emailForm.valid){
      this.authService.emailVerification(this.emailForm.value).subscribe({
        next: (res) => {
          console.log(res);
          // 0- Hide Error msg
          this.errorMsg.set('')

          // 1- Show Success Msg
          this.successMsg.set(res.message)

          // 2- Navigate To OTP Page
          setTimeout(() => {
            this.router.navigate(['/roseApp/auth/otp'], {
              // To Store Email
              queryParams:{
                email:this.emailForm.value.email
              }
            })
          }, 3000);

        },
        error: (err) => {
          console.log(err);
          // 0- Hide Success Msg
          this.successMsg.set('')

          // 1- Show Error Msg 
          this.errorMsg.set(err.error.message)
        }
      });
    }
  }
}
