import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAngularModule, LoaderCircle } from 'lucide-angular';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './spinner.html',
  styleUrl: './spinner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Spinner {
  readonly LoaderCircle = LoaderCircle;

  size = input<number>(18);
  label = input<string>('Loading');
}
