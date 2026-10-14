import { FormControl } from '@angular/forms';

export interface ForgotPasswordForm {
  email: FormControl<string>;
}

export interface ResetPasswordForm {
  newPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
}
