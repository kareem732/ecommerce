import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { egPhoneValidator } from './address.validators';

const validate = (value: string) => egPhoneValidator(new FormControl(value));

describe('egPhoneValidator', () => {
  it.each(['01012345678', '+201112345678', '010 1234 5678', '+20-111-234-5678'])(
    'accepts %s',
    (value) => {
      expect(validate(value)).toBeNull();
    },
  );

  it('ignores empty values so required can handle them', () => {
    expect(validate('')).toBeNull();
  });

  it.each(['123', '01312345678', '+20101234567', '0101234567890'])('rejects %s', (value) => {
    expect(validate(value)).toEqual({ phone: true });
  });
});
