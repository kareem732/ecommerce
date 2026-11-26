import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { OverviewCategory } from '../../interfaces/overview.res';

@Component({
  selector: 'app-categories-list',
  imports: [TranslatePipe],
  templateUrl: './categories-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class CategoriesList {
  readonly categories = input.required<OverviewCategory[]>();
}
