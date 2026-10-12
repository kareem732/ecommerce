import {ChangeDetectionStrategy,Component,ElementRef,HostListener,computed,forwardRef,inject,input,signal} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {LucideAngularModule,ChevronDown,ChevronsUpDown,Check} from 'lucide-angular';
import { Label } from '../label/label';
import { SelectOption } from './select.types';

let nextId = 0;

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [LucideAngularModule, Label],
  templateUrl: './select.html',
  styleUrl: './select.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Select),
      multi: true,
    },
  ],
})
export class Select implements ControlValueAccessor {
  private host = inject(ElementRef<HTMLElement>);

  readonly id = `app-select-${nextId++}`;
  readonly ChevronDown = ChevronDown;
  readonly ChevronsUpDown = ChevronsUpDown;
  readonly Check = Check;

  label = input<string>('');
  placeholder = input<string>('Select an option');
  options = input<SelectOption[]>([]);
  error = input<string>('');
  disabled = input<boolean>(false);
  arrow = input<'chevron' | 'updown'>('chevron');

  value = signal<string | null>(null);
  open = signal(false);
  formDisabled = signal(false);
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  selectedLabel = computed(
    () => this.options().find((o) => o.value === this.value())?.label ?? '',
  );

  private onChange: (v: string | null) => void = () => {
    /* set by registerOnChange */
  };
  private onTouched: () => void = () => {
    /* set by registerOnTouched */
  };

  writeValue(v: string | null): void {
    this.value.set(v ?? null);
  }
  registerOnChange(fn: (v: string | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  toggle(): void {
    if (this.isDisabled()) return;
    this.open.update((v) => !v);
    if (!this.open()) this.onTouched();
  }

  select(option: SelectOption): void {
    if (option.disabled) return;
    this.value.set(option.value);
    this.onChange(option.value);
    this.open.set(false);
    this.onTouched();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target)) {
      this.open.set(false);
      this.onTouched();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open.set(false);
  }
}
