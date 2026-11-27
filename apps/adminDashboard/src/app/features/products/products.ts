import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import {
  DataTable,
  DataTableAction,
  DataTableActionEvent,
  DataTableCell,
  DataTableColumn,
} from '@org/ui';
import { Eye, Pencil, Trash2 } from 'lucide-angular';
import { AdminProduct } from './product.model';
import { PRODUCTS_MOCK } from './products.mock';

/** Stock at or below this is highlighted as low. */
const LOW_STOCK = 4;

@Component({
  selector: 'app-admin-products',
  imports: [TranslatePipe, DataTable, DataTableCell],
  templateUrl: './products.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products {
  // Demo data; replace with the products API when it is ready.
  protected readonly products = signal<AdminProduct[]>(PRODUCTS_MOCK);
  protected readonly lowStock = LOW_STOCK;
  protected readonly lastAction = signal<{
    action: string;
    title: string;
  } | null>(null);

  protected readonly columns: DataTableColumn<AdminProduct>[] = [
    {
      field: 'imgCover',
      header: 'ADMIN.PRODUCTS.COLUMNS.IMAGE',
      type: 'image',
      width: '5rem',
    },
    { field: 'title', header: 'ADMIN.PRODUCTS.COLUMNS.TITLE', sortable: true },
    {
      field: 'category.name',
      header: 'ADMIN.PRODUCTS.COLUMNS.CATEGORY',
      sortable: true,
    },
    {
      field: 'price',
      header: 'ADMIN.PRODUCTS.COLUMNS.PRICE',
      type: 'currency',
      sortable: true,
    },
    {
      field: 'quantity',
      header: 'ADMIN.PRODUCTS.COLUMNS.STOCK',
      sortable: true,
    },
    {
      field: 'sold',
      header: 'ADMIN.PRODUCTS.COLUMNS.SOLD',
      type: 'number',
      sortable: true,
    },
    { field: 'status', header: 'ADMIN.PRODUCTS.COLUMNS.STATUS' },
    {
      field: 'createdAt',
      header: 'ADMIN.PRODUCTS.COLUMNS.CREATED',
      type: 'date',
      sortable: true,
    },
  ];

  protected readonly actions: DataTableAction<AdminProduct>[] = [
    { id: 'view', label: 'ADMIN.PRODUCTS.ACTIONS.VIEW', icon: Eye },
    { id: 'edit', label: 'ADMIN.PRODUCTS.ACTIONS.EDIT', icon: Pencil },
    {
      id: 'delete',
      label: 'ADMIN.PRODUCTS.ACTIONS.DELETE',
      icon: Trash2,
      variant: 'danger',
    },
  ];

  protected onAction({
    action,
    row,
  }: DataTableActionEvent<AdminProduct>): void {
    if (action === 'delete') {
      this.products.update((list) => list.filter((p) => p.id !== row.id));
    }
    // View / edit dialogs are not built yet; show which action was picked.
    this.lastAction.set({ action, title: row.title });
  }
}
