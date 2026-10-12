import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-label',
  standalone: true,
  templateUrl: './label.html',
  styleUrl: './label.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Label {
  text = input<string>('');
  for = input<string>('');
  required = input<boolean>(false);
  error = input<boolean>(false);
  disabled = input<boolean>(false);
}
