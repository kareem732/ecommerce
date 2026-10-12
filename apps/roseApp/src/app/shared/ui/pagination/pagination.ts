import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [PaginatorModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
  totalRecords = input<number>(100);
  rows = input<number>(10);
  pageLinks = input<number>(3);

  first = model<number>(0);
  pageChange = output<number>();

  currentPage = computed(() => Math.floor(this.first() / this.rows()) + 1);

  onPageChange(event: PaginatorState): void {
    this.first.set(event.first ?? 0);
    this.pageChange.emit((event.page ?? 0) + 1);
  }
}
