import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export type ForgetPasswordStep = 'email' | 'sent' | 'reset';

export function passwordsMatch(
  passwordKey = 'password',
  confirmKey = 'confirmPassword',
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordKey);
    const confirm = group.get(confirmKey);
    if (!password || !confirm) return null;

    if (confirm.value && password.value !== confirm.value) {
      confirm.setErrors({ ...confirm.errors, passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirm.hasError('passwordMismatch')) {
      const { passwordMismatch, ...rest } = confirm.errors ?? {};
      confirm.setErrors(Object.keys(rest).length ? rest : null);
    }
    return null;
  };
}
