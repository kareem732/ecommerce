import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BadgeVariant = 'primary' | 'primary-dark' | 'soft' | 'soft-strong' | 'neutral' | 'neutral-strong';

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
