import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.html',
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card {
  image = input<string>('');
  imageAlt = input<string>('');
  aspectRatio = input<string>('1 / 1');
  bordered = input<boolean>(false);
  interactive = input<boolean>(false);
}
