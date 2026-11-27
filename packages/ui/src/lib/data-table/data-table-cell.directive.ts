import { Directive, TemplateRef, inject, input } from '@angular/core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DataTableCellContext<T = any> {
  /** The row, available as `let-row`. */
  $implicit: T;
  /** The resolved field value, available as `let-value="value"`. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

/**
 * Custom cell template for one column of `app-data-table`:
 *
 * ```html
 * <ng-template appDataTableCell="status" [appDataTableCellOf]="products()" let-row let-value="value">
 *   …
 * </ng-template>
 * ```
 *
 * `appDataTableCellOf` is optional; pass the table data to get a typed `row`.
 */
@Directive({ selector: 'ng-template[appDataTableCell]' })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class DataTableCell<T = any> {
  /** The column `field` this template renders. */
  readonly field = input.required<string>({ alias: 'appDataTableCell' });
  /** Only used to infer the row type for `let-row`. */
  readonly of = input<readonly T[] | undefined>(undefined, { alias: 'appDataTableCellOf' });

  readonly template = inject<TemplateRef<DataTableCellContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _dir: DataTableCell<T>,
    ctx: unknown,
  ): ctx is DataTableCellContext<T> {
    return true;
  }
}
