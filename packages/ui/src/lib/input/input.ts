import {ChangeDetectionStrategy,Component,computed,forwardRef,input,signal} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {LucideAngularModule,LucideIconData,Eye,EyeOff} from 'lucide-angular';
import { Label } from '../label/label';

let nextId = 0;

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [LucideAngularModule, Label],
  templateUrl: './input.html',
  styleUrl: './input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Input),
      multi: true,
    },
  ],
})
export class Input implements ControlValueAccessor {
  readonly id = `app-input-${nextId++}`;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;

  label = input<string>('');
  placeholder = input<string>('');
  type = input<string>('text');
  icon = input<LucideIconData | null>(null);
  error = input<string>('');
  disabled = input<boolean>(false);

  value = signal('');
  formDisabled = signal(false);
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  isPassword = computed(() => this.type() === 'password');
  showPassword = signal(false);
  inputType = computed(() =>
    this.isPassword() && this.showPassword() ? 'text' : this.type(),
  );

  private onChange: (v: string) => void = () => {
    /* set by registerOnChange */
  };
  private onTouched: () => void = () => {
    /* set by registerOnTouched */
  };

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
    const v = (event.target as HTMLInputElement).value;
    this.value.set(v);
    this.onChange(v);
  }

  onBlur(): void {
    this.onTouched();
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }
}
