import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { FormErrorService } from './form-error.service';

describe('FormErrorService', () => {
  const scope = () => TestBed.inject(FormErrorService).scope('T');

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [FormErrorService, provideTranslateService()] });

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      T: {
        REQUIRED: 'Required',
        EMAIL: 'Bad email',
        MIN_LENGTH: 'Too short',
        PHONE: 'Bad phone',
        PATTERN: 'Bad pattern',
        PASSWORD: 'Weak password',
        MISMATCH: 'No match',
      },
    });
    translate.use('en');
  });

  describe('of', () => {
    it('returns nothing until the control is touched', () => {
      const control = new FormControl('', Validators.required);

      expect(scope().of(control)).toBe('');
      expect(scope().of(null)).toBe('');
    });

    it('maps validators to translated messages', () => {
      const required = new FormControl('', Validators.required);
      const email = new FormControl('x', Validators.email);
      const minLength = new FormControl('ab', Validators.minLength(3));
      const phone = new FormControl('x');
      phone.setErrors({ phone: true });

      [required, email, minLength, phone].forEach((c) => c.markAsTouched());

      expect(scope().of(required)).toBe('Required');
      expect(scope().of(email)).toBe('Bad email');
      expect(scope().of(minLength)).toBe('Too short');
      expect(scope().of(phone)).toBe('Bad phone');
    });

    it('uses PATTERN by default and PASSWORD when asked', () => {
      const control = new FormControl('abc', Validators.pattern(/^\d+$/));
      control.markAsTouched();

      expect(scope().of(control)).toBe('Bad pattern');
      expect(scope().of(control, 'PASSWORD')).toBe('Weak password');
    });

    it('returns nothing for a valid control', () => {
      const control = new FormControl('ok', Validators.required);
      control.markAsTouched();

      expect(scope().of(control)).toBe('');
    });
  });

  describe('confirm', () => {
    const makeForm = (password: string, confirm: string) =>
      new FormGroup(
        { password: new FormControl(password), confirm: new FormControl(confirm, Validators.required) },
        {
          validators: (g) =>
            g.get('password')?.value === g.get('confirm')?.value ? null : { mismatch: true },
        },
      );

    it('returns nothing until touched', () => {
      const form = makeForm('a', 'b');

      expect(scope().confirm(form, form.controls.confirm)).toBe('');
    });

    it('shows required first', () => {
      const form = makeForm('a', '');
      form.controls.confirm.markAsTouched();

      expect(scope().confirm(form, form.controls.confirm)).toBe('Required');
    });

    it('shows mismatch when the form has the mismatch error', () => {
      const form = makeForm('a', 'b');
      form.controls.confirm.markAsTouched();

      expect(scope().confirm(form, form.controls.confirm)).toBe('No match');
    });

    it('returns nothing when the values match', () => {
      const form = makeForm('a', 'a');
      form.controls.confirm.markAsTouched();

      expect(scope().confirm(form, form.controls.confirm)).toBe('');
    });
  });
});