import { FormControl } from '@angular/forms';

export interface ResetPasswordForm {
  newPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
}