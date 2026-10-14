import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import parsePhoneNumberFromString from 'libphonenumber-js';

export const STRONG_PASSWORD = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export const fieldsMatch =
  (field: string, confirmField: string) =>
  (group: AbstractControl): ValidationErrors | null =>
    group.get(field)?.value === group.get(confirmField)?.value ? null : { mismatch: true };

export const optionalPhone: ValidatorFn = (control) => {
  const value = control.value as string;
  if (!value) return null;
  return parsePhoneNumberFromString(value)?.isValid() ? null : { phone: true };
};
