import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ArrowRight, Gift, LucideAngularModule } from 'lucide-angular';
import { CollectionCardItem } from '../../interfaces/collection-card.model';

@Component({
  selector: 'app-collection-card',
  imports: [RouterLink, TranslatePipe, LucideAngularModule],
  templateUrl: './collection-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionCard {
  readonly item = input.required<CollectionCardItem>();

  protected readonly ArrowRight = ArrowRight;
  protected readonly Gift = Gift;
}
