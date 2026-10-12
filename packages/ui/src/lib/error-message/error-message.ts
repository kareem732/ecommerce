import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-error-message',
  standalone: true,
  templateUrl: './error-message.html',
  styleUrl: './error-message.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorMessage {
  message = input<string>('');
  id = input<string>('');
}
