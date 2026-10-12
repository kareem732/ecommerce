import { Component, inject } from '@angular/core';
import { Stepper } from '../../../../shared/ui/stepper/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { Input } from '../../../../shared/ui/input/input';
import { Phone } from '../../../../shared/ui/phone/phone';
import { Select } from '../../../../shared/ui/select/select';
import { Button } from '../../../../shared/ui/button/button';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterData } from '../../services/register-data/register-data';

@Component({
  selector: 'app-user-info',
  imports: [Stepper, Input, Phone, Select, Button, ReactiveFormsModule],
  templateUrl: './user-info.html',
  styleUrl: './user-info.scss',
})
export class UserInfo {
  private readonly router = inject(Router)
  private readonly registerData = inject(RegisterData);
  genderOptions = [
    { label: 'Female', value: 'FEMALE' },
    { label: 'Male', value: 'MALE' }
  ];

  userInfoForm: FormGroup = new FormGroup({
    firstName: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    lastName: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    username: new FormControl(null, [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)]),
    phone: new FormControl(null, [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)]),
    gender: new FormControl(null, [Validators.required])
  })

  infoButton() {
    if (this.userInfoForm.valid) {

      // Store Email
      console.log(this.userInfoForm.value);
      this.registerData.registerData = {
        ...this.registerData.registerData,
        ...this.userInfoForm.getRawValue()
      };

      console.log(this.registerData.registerData);

      // Navigate to Password Page
      this.router.navigate(['/roseApp/auth/password']);
    }
  }


}
