import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-pagination',
  imports: [PaginatorModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
  readonly totalRecords = input<number>(100);
  readonly rows = input<number>(10);
  readonly pageLinks = input<number>(3);

  readonly first = model<number>(0);

  readonly pageChange = output<number>();

  readonly currentPage = computed(
    () => Math.floor(this.first() / this.rows()) + 1,
  );

  protected onPageChange(event: PaginatorState): void {
    this.first.set(event.first ?? 0);
    this.pageChange.emit((event.page ?? 0) + 1);
  }
}
