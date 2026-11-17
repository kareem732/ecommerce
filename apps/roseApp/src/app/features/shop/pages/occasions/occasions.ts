import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LanguageService } from '@org/shared-i18n';
import { skipLoading } from '../../../../core/interceptors/loading.interceptor';
import { PRODUCTS_PATH } from '../../constants/shop-routes.constants';
import { CollectionGrid } from '../../components/collection-grid/collection-grid';
import { CollectionCardItem } from '../../interfaces/collection-card.model';
import { Occasion } from '../../interfaces/home.model/home-model-response';
import { OccasionTitlePipe } from '../../pipes/occasion-title.pipe';
import { ShopService } from '../../services/shop.service';
import { pagedCollection } from '../../utils/paged-collection';

@Component({
  selector: 'app-occasions',
  imports: [CollectionGrid],
  providers: [OccasionTitlePipe],
  template: `
    <app-collection-grid
      titleKey="NAV.OCCASIONS"
      subtitleKey="COLLECTIONS.OCCASIONS.SUBTITLE"
      emptyKey="COLLECTIONS.OCCASIONS.EMPTY"
      [items]="cards()"
      [page]="occasions.page()"
      [pageSize]="occasions.pageSize"
      [total]="occasions.total()"
      (pageChange)="occasions.page.set($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Occasions {
  private readonly shop = inject(ShopService);
  private readonly occasionTitle = inject(OccasionTitlePipe);
  private readonly language = inject(LanguageService);

  protected readonly occasions = pagedCollection((query) =>
    this.shop.getOccasions(query, skipLoading()),
  );

  /** Re-mapped on language change so translated occasion titles stay in sync. */
  protected readonly cards = computed(() => {
    this.language.currentLang();
    return this.occasions.items()?.map((occasion) => this.toCard(occasion)) ?? null;
  });

  private toCard(occasion: Occasion): CollectionCardItem {
    return {
      id: occasion.id,
      title: this.occasionTitle.transform(occasion.title),
      subtitle: occasion.description,
      image: occasion.image,
      productCount: null,
      link: PRODUCTS_PATH,
      queryParams: { occasionId: occasion.id },
    };
  }
}
