import { LucideIconData } from 'lucide-angular';
import { BadgeVariant } from '../badge/badge.types';

/** How a cell value is rendered when no custom `appDataTableCell` template is given. */
export type DataTableColumnType = 'text' | 'number' | 'currency' | 'date' | 'image' | 'badge';

export interface DataTableColumn<T = unknown> {
  /** Property to read from the row. Dot paths are supported, e.g. `category.name`. */
  field: string;
  /** Header text or translation key. */
  header: string;
  type?: DataTableColumnType;
  sortable?: boolean;
  /** Any CSS width, e.g. `'12rem'` or `'20%'`. */
  width?: string;
  /** Currency code for `type: 'currency'` (default `EGP`). */
  currency?: string;
  /** Angular date format for `type: 'date'` (default `mediumDate`). */
  dateFormat?: string;
  /** Badge colour for `type: 'badge'`, chosen per row. */
  badgeVariant?: (row: T) => BadgeVariant;
  /** Custom text for the cell; wins over `type`. */
  format?: (value: unknown, row: T) => string;
}

export type DataTableActionVariant = 'default' | 'danger';

export interface DataTableAction<T = unknown> {
  /** Emitted back in `actionClick`, e.g. `'edit'`, `'delete'`. */
  id: string;
  /** Accessible label / tooltip text or translation key. */
  label: string;
  icon: LucideIconData;
  variant?: DataTableActionVariant;
  hidden?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
}

export interface DataTableActionEvent<T = unknown> {
  action: string;
  row: T;
}

/** Emitted in `lazy` mode whenever the page or sort changes, so the parent can refetch. */
export interface DataTableLazyLoadEvent {
  /** 1-based page number. */
  page: number;
  rows: number;
  first: number;
  sortField?: string;
  /** `1` ascending, `-1` descending. */
  sortOrder?: 1 | -1;
}
