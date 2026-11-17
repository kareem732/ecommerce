import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Pagination } from '@org/ui';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';
import { CollectionCardItem } from '../../interfaces/collection-card.model';
import { CollectionCard } from '../collection-card/collection-card';

/** Page layout listing collections; `items` is `null` while loading. */
@Component({
  selector: 'app-collection-grid',
  imports: [TranslatePipe, CollectionCard, Pagination, PageHeader],
  templateUrl: './collection-grid.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionGrid {
  private readonly document = inject(DOCUMENT);

  readonly titleKey = input.required<string>();
  readonly subtitleKey = input.required<string>();
  readonly emptyKey = input.required<string>();
  readonly items = input.required<CollectionCardItem[] | null>();
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly total = input.required<number>();

  readonly pageChange = output<number>();

  protected readonly first = computed(() => (this.page() - 1) * this.pageSize());
  protected readonly skeletons = computed(() =>
    Array.from({ length: this.pageSize() }, (_, i) => i),
  );

  protected onPageChange(page: number): void {
    this.pageChange.emit(page);
    this.document.defaultView?.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
