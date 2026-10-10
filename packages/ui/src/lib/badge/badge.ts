import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BadgeVariant } from './badge.types';

@Component({
  selector: 'app-badge',
  standalone: true,
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Badge {
  value = input.required<string>();
  variant = input<BadgeVariant>('primary');
}
