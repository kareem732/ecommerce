import { FormControl } from '@angular/forms';
import { Gender } from '@org/auth-service';

export interface EmailForm {
  email: FormControl<string>;
}

export interface ProfileForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  username: FormControl<string>;
  phone: FormControl<string>;
  gender: FormControl<Gender | ''>;
}

export interface PasswordForm {
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}
