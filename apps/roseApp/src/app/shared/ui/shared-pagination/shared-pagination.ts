import { Component, input, output } from '@angular/core';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

export interface PaginationChange {
  page: number;
  rows: number;
}

@Component({
  selector: 'app-shared-pagination',
  standalone: true,
  imports: [PaginatorModule],
  template: `
    <p-paginator
      class="mt-8"
      [first]="(currentPage() - 1) * pageSize()"
      [rows]="pageSize()"
      [totalRecords]="totalItems()"
      [alwaysShow]="false"
      [showFirstLastIcon]="true"
      [pt]="{ root: { class: 'border-0 bg-transparent' } }"
      (onPageChange)="handlePageChange($event)"
    />
  `,
})
export class SharedPagination {
  readonly currentPage = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly totalItems = input.required<number>();
  readonly pageChange = output<PaginationChange>();

  protected handlePageChange(event: PaginatorState): void {
    const page = event.page;
    const rows = event.rows;
    if (page == null || rows == null || rows <= 0) return;
    if (page === this.currentPage() - 1 && rows === this.pageSize()) return;

    this.pageChange.emit({ page, rows });
  }
}
