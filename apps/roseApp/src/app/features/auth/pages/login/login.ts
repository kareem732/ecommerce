import { Component, signal } from '@angular/core';
import { Input } from '../../../../shared/ui/input/input';
import { Button } from '../../../../shared/ui/button/button';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Alert } from '../../../../shared/ui/alert/alert';

@Component({
  selector: 'app-login',
  imports: [Input, Button, ReactiveFormsModule, Alert],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  get email() {
    return this.loginForm.controls['username'];
  }
  
  get pass(){
    return this.loginForm.controls['password']
  }


  loginForm: FormGroup = new FormGroup({
    username: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=]).{8,}$/)])
  })

  loginButton(){
    if(this.loginForm.valid){
      console.log(this.loginForm);
    }
  }
}
