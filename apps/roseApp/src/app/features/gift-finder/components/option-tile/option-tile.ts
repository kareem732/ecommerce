import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Check, LucideAngularModule, LucideIconData } from 'lucide-angular';

/** Selectable answer card used by every Gift Finder question. */
@Component({
  selector: 'app-option-tile',
  imports: [LucideAngularModule],
  templateUrl: './option-tile.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionTile {
  readonly label = input.required<string>();
  readonly icon = input<LucideIconData | null>(null);
  readonly image = input<string | null>(null);
  readonly selected = input(false);

  readonly picked = output<void>();

  protected readonly Check = Check;
}
