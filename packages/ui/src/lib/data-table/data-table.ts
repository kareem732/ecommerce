import { CurrencyPipe, DOCUMENT, DatePipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  DestroyRef,
  computed,
  contentChildren,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { EllipsisVertical, LucideAngularModule } from 'lucide-angular';
import { MenuItem } from 'primeng/api';
import { Menu, MenuModule } from 'primeng/menu';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Badge } from '../badge/badge';
import { DataTableCell, DataTableCellContext } from './data-table-cell.directive';
import {
  DataTableAction,
  DataTableActionEvent,
  DataTableColumn,
  DataTableLazyLoadEvent,
} from './data-table.types';

/**
 * Shared table built on PrimeNG `p-table`, configured by `columns` and `actions`.
 *
 * - Cells render by column `type`; override any column with `<ng-template appDataTableCell="field">`.
 * - Row actions open from a ⋮ button in a column frozen at the end of the row with PrimeNG `pFrozenColumn`.
 * - Client-side paging/sorting by default; set `lazy` and listen to `lazyLoad` for server-side.
 */
@Component({
  selector: 'app-data-table',
  imports: [
    TableModule,
    MenuModule,
    NgTemplateOutlet,
    DecimalPipe,
    CurrencyPipe,
    DatePipe,
    TranslatePipe,
    LucideAngularModule,
    Badge,
  ],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTable<T extends object = Record<string, unknown>> {
  readonly data = input<readonly T[]>([]);
  readonly columns = input.required<readonly DataTableColumn<T>[]>();
  readonly actions = input<readonly DataTableAction<T>[]>([]);
  /** Row property that uniquely identifies a row. */
  readonly dataKey = input<string>('id');

  readonly loading = input<boolean>(false);
  readonly paginator = input<boolean>(true);
  readonly rows = input<number>(10);
  readonly rowsPerPageOptions = input<number[] | undefined>(undefined);

  /** Server-side mode: the table only emits `lazyLoad`; the parent fetches and sets `data`/`totalRecords`. */
  readonly lazy = input<boolean>(false);
  readonly totalRecords = input<number>(0);

  /** Translation keys (or plain text). */
  readonly actionsHeader = input<string>('Actions');
  readonly emptyMessage = input<string>('No data found');

  /** Minimum table width before it scrolls horizontally. */
  readonly minWidth = input<string>('50rem');

  readonly actionClick = output<DataTableActionEvent<T>>();
  readonly lazyLoad = output<DataTableLazyLoadEvent>();

  private readonly cellTemplates = contentChildren(DataTableCell);
  private readonly actionsMenu = viewChild.required<Menu>('actionsMenu');

  protected readonly EllipsisVertical = EllipsisVertical;

  /** Tracks `<html dir>` (set by LanguageService) so the frozen column can follow the language. */
  private readonly isRtl = signal(false);
  /**
   * `pFrozenColumn` only knows LTR: `alignFrozen="right"` pins to the physical right, and `"left"`
   * offsets by the widths of the previous columns. In RTL the actions column sits on the left, so
   * we keep `alignFrozen="right"` and add `left: 0` to pin it to the left edge instead.
   */
  protected readonly rtlFrozenLeft = computed(() => (this.isRtl() ? 0 : null));
  /** Row whose actions popup is open. */
  protected readonly menuRow = signal<T | null>(null);
  protected readonly menuItems = signal<MenuItem[]>([]);

  constructor() {
    const root = inject(DOCUMENT).documentElement;
    const read = () => this.isRtl.set(root.dir === 'rtl');
    read();
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(read);
      observer.observe(root, { attributes: true, attributeFilter: ['dir'] });
      inject(DestroyRef).onDestroy(() => observer.disconnect());
    }
  }

  protected readonly templates = computed(() => {
    const map = new Map<string, TemplateRef<DataTableCellContext<T>>>();
    for (const cell of this.cellTemplates()) {
      map.set(cell.field(), cell.template as TemplateRef<DataTableCellContext<T>>);
    }
    return map;
  });

  protected readonly hasActions = computed(() => this.actions().length > 0);
  protected readonly colspan = computed(() => this.columns().length + (this.hasActions() ? 1 : 0));
  protected readonly total = computed(() => (this.lazy() ? this.totalRecords() : this.data().length));

  /** Reads `field` from the row; supports dot paths like `category.name`. */
  protected valueOf(row: T, field: string): unknown {
    return field
      .split('.')
      .reduce<unknown>(
        (value, key) => (value == null ? undefined : (value as Record<string, unknown>)[key]),
        row,
      );
  }

  protected openActions(event: MouseEvent, row: T): void {
    const menu = this.actionsMenu();
    // Clicking the same row's button again just closes the popup.
    if (menu.visible && this.menuRow() === row) {
      menu.hide();
      return;
    }
    this.menuItems.set(
      this.actions()
        .filter((action) => !(action.hidden?.(row) ?? false))
        .map((action) => ({
          id: action.id,
          label: action.label,
          disabled: action.disabled?.(row) ?? false,
          state: { icon: action.icon, danger: action.variant === 'danger' },
          command: () => this.actionClick.emit({ action: action.id, row }),
        })),
    );
    this.menuRow.set(row);
    menu.show(event);
  }

  /**
   * `onHide` fires after the close animation. Drop the row and its action closures so nothing is
   * kept alive between opens — unless the menu was reopened during that animation.
   */
  protected onMenuHide(): void {
    if (this.actionsMenu().visible) return;
    this.menuRow.set(null);
    this.menuItems.set([]);
  }

  protected onLazyLoad(event: TableLazyLoadEvent): void {
    const rows = event.rows ?? this.rows();
    const first = event.first ?? 0;
    const sortField = typeof event.sortField === 'string' ? event.sortField : undefined;
    this.lazyLoad.emit({
      page: Math.floor(first / rows) + 1,
      rows,
      first,
      sortField,
      sortOrder: sortField ? (event.sortOrder === -1 ? -1 : 1) : undefined,
    });
  }
}
