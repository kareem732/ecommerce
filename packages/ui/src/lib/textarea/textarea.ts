import {ChangeDetectionStrategy,Component,computed,forwardRef,input,signal} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Label } from '../label/label';

let nextId = 0;

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [Label],
  templateUrl: './textarea.html',
  styleUrl: './textarea.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Textarea),
      multi: true,
    },
  ],
})
export class Textarea implements ControlValueAccessor {
  readonly id = `app-textarea-${nextId++}`;

  label = input<string>('');
  placeholder = input<string>('');
  error = input<string>('');
  rows = input<number>(4);
  disabled = input<boolean>(false);

  value = signal('');
  formDisabled = signal(false);
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  private onChange: (v: string) => void = () => {
    /* set by registerOnChange */
  };
  private onTouched: () => void = () => {
    /* set by registerOnTouched */
  };

  // ControlValueAccessor
  writeValue(v: string | null): void {
    this.value.set(v ?? '');
  }
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  onInput(event: Event): void {
    const v = (event.target as HTMLTextAreaElement).value;
    this.value.set(v);
    this.onChange(v);
  }

  onBlur(): void {
    this.onTouched();
  }
}
