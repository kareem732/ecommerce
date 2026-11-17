import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Pagination } from '@org/ui';
import { skipLoading } from '../../../../core/interceptors/loading.interceptor';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';
import { OrderCard } from '../../components/order-card/order-card';
import { ShopService } from '../../services/shop.service';
import { pagedCollection } from '../../utils/paged-collection';

@Component({
  selector: 'app-order',
  imports: [TranslatePipe, OrderCard, PageHeader, Pagination],
  templateUrl: './order.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Order {
  private readonly shop = inject(ShopService);
  private readonly document = inject(DOCUMENT);

  protected readonly orders = pagedCollection((query) =>
    this.shop.getOrderHistory(query, skipLoading()),
  );
  protected readonly first = computed(() => (this.orders.page() - 1) * this.orders.pageSize);

  protected onPageChange(page: number): void {
    this.orders.page.set(page);
    this.document.defaultView?.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
