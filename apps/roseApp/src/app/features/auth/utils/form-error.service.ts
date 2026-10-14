import { Injectable, inject } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

export type ErrorKey =
  | 'REQUIRED'
  | 'EMAIL'
  | 'MIN_LENGTH'
  | 'PHONE'
  | 'PATTERN'
  | 'PASSWORD'
  | 'MISMATCH';

export type PatternErrorKey = Extract<ErrorKey, 'PATTERN' | 'PASSWORD'>;

export interface FormErrorScope {
  of(control: AbstractControl | null, patternKey?: PatternErrorKey): string;
  confirm(form: AbstractControl, confirmControl: AbstractControl | null): string;
}

@Injectable()
export class FormErrorService {
  private readonly translate = inject(TranslateService);

  scope(prefix: string): FormErrorScope {
    return {
      of: (control, patternKey = 'PATTERN') => {
        if (!control?.touched) return '';
        const key = this.keyOf(control, patternKey);
        return key ? this.text(`${prefix}.${key}`) : '';
      },
      confirm: (form, control) => {
        if (!control?.touched) return '';
        if (control.hasError('required')) return this.text(`${prefix}.REQUIRED`);
        return form.hasError('mismatch') ? this.text(`${prefix}.MISMATCH`) : '';
      },
    };
  }

  private keyOf(control: AbstractControl, patternKey: PatternErrorKey): ErrorKey | null {
    if (control.hasError('required')) return 'REQUIRED';
    if (control.hasError('email')) return 'EMAIL';
    if (control.hasError('minlength')) return 'MIN_LENGTH';
    if (control.hasError('phone')) return 'PHONE';
    if (control.hasError('pattern')) return patternKey;
    return null;
  }

  private text(key: string): string {
    const value: unknown = this.translate.instant(key);
    return typeof value === 'string' ? value : '';
  }
}
