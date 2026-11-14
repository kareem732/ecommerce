import { ValidatorFn } from '@angular/forms';

const EG_LOCAL = /^01[0125]\d{8}$/;
const EG_INTERNATIONAL = /^\+201[0125]\d{8}$/;

export const egPhoneValidator: ValidatorFn = (control) => {
  const raw = String(control.value ?? '');
  if (!raw) return null;

  const value = raw.replace(/[\s-]/g, '');
  return EG_LOCAL.test(value) || EG_INTERNATIONAL.test(value) ? null : { phone: true };
};
