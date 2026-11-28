import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TopSellingProduct } from '../../interfaces/overview.res';

@Component({
  selector: 'app-top-selling-list',
  imports: [DecimalPipe, TranslatePipe],
  templateUrl: './top-selling-list.html',
  styleUrl: './top-selling-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class TopSellingList {
  readonly products = input.required<TopSellingProduct[]>();
  readonly currency = input('');
}
