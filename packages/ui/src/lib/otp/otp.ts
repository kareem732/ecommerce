import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputOtpModule } from 'primeng/inputotp';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [FormsModule, InputOtpModule],
  templateUrl: './otp.html',
  styleUrl: './otp.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Otp {
  length = input<number>(6);
  error = input<string>('');
  disabled = input<boolean>(false);
  mask = input<boolean>(false);

  changed = output<string>();
  completed = output<string>();

  protected readonly code = signal('');

  onChange(value: string | null): void {
    const next = value ?? '';
    this.code.set(next);
    this.changed.emit(next);
    if (next.length === this.length()) {
      this.completed.emit(next);
    }
  }

  clear(): void {
    this.code.set('');
    this.changed.emit('');
  }
}
