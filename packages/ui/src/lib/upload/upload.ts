import {ChangeDetectionStrategy,Component,ElementRef,computed,forwardRef,input,output,signal,viewChild} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {LucideAngularModule,Upload as UploadIcon,Image as ImageIcon} from 'lucide-angular';
import { Label } from '../label/label';

let nextId = 0;

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [LucideAngularModule, Label],
  templateUrl: './upload.html',
  styleUrl: './upload.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Upload),
      multi: true,
    },
  ],
})
export class Upload implements ControlValueAccessor {
  readonly id = `app-upload-${nextId++}`;
  readonly UploadIcon = UploadIcon;
  readonly ImageIcon = ImageIcon;

  private fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  label = input<string>('');
  buttonLabel = input<string>('Upload file');
  accept = input<string>('');
  error = input<string>('');
  disabled = input<boolean>(false);
  currentLabel = input<string>('');

  reviewClick = output<void>();

  file = signal<File | null>(null);
  formDisabled = signal(false);
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  private onChange: (v: File | null) => void = () => {
    /* set by registerOnChange */
  };
  private onTouched: () => void = () => {
    /* set by registerOnTouched */
  };

  writeValue(v: File | null): void {
    this.file.set(v ?? null);
    if (!v) {
      const el = this.fileInput()?.nativeElement;
      if (el) el.value = '';
    }
  }
  registerOnChange(fn: (v: File | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  open(): void {
    if (this.isDisabled()) return;
    this.fileInput()?.nativeElement.click();
  }

  onFileChange(event: Event): void {
    const f = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.file.set(f);
    this.onChange(f);
    this.onTouched();
  }
}
