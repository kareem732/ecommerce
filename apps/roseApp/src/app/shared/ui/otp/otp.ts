import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
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

  completed = output<string>();

  code = '';

  onChange(value: string): void {
    this.code = value;
    if (value?.length === this.length()) {
      this.completed.emit(value);
    }
  }
}
