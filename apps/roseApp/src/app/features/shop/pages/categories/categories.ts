import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { skipLoading } from '../../../../core/interceptors/loading.interceptor';
import { PRODUCTS_PATH } from '../../constants/shop-routes.constants';
import { CollectionGrid } from '../../components/collection-grid/collection-grid';
import { CollectionCardItem } from '../../interfaces/collection-card.model';
import { Category } from '../../interfaces/home.model/home-model-response';
import { ShopService } from '../../services/shop.service';
import { pagedCollection } from '../../utils/paged-collection';

const toCard = (category: Category): CollectionCardItem => ({
  id: category.id,
  title: category.title,
  subtitle: category.description,
  image: category.image,
  productCount: category._count?.products ?? null,
  link: PRODUCTS_PATH,
  queryParams: { categoryId: category.id },
});

@Component({
  selector: 'app-categories',
  imports: [CollectionGrid],
  template: `
    <app-collection-grid
      titleKey="NAV.CATEGORIES"
      subtitleKey="COLLECTIONS.CATEGORIES.SUBTITLE"
      emptyKey="COLLECTIONS.CATEGORIES.EMPTY"
      [items]="cards()"
      [page]="categories.page()"
      [pageSize]="categories.pageSize"
      [total]="categories.total()"
      (pageChange)="categories.page.set($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Categories {
  private readonly shop = inject(ShopService);

  protected readonly categories = pagedCollection((query) =>
    this.shop.getCategories(query, skipLoading()),
  );
  protected readonly cards = computed(() => this.categories.items()?.map(toCard) ?? null);
}
