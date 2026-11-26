import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LowStockProduct } from '../../interfaces/overview.res';

const CRITICAL_STOCK = 5;

const STOCK_TONE = {
  critical: 'text-red-600 dark:text-red-400',
  normal: 'text-[#27272A] dark:text-slate-200',
};

const toneFor = (stock: number): string =>
  stock <= CRITICAL_STOCK ? STOCK_TONE.critical : STOCK_TONE.normal;

@Component({
  selector: 'app-low-stock-list',
  imports: [TranslatePipe],
  templateUrl: './low-stock-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class LowStockList {
  readonly products = input.required<LowStockProduct[]>();

  protected readonly rows = computed(() =>
    this.products().map((product) => ({
      ...product,
      toneClass: toneFor(product.stock),
    })),
  );
}
