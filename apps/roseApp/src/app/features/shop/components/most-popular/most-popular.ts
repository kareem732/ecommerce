import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';
import { Product } from '../../interfaces/home.model/home-model-response';
import { HomeStore } from '../../stores/home/home.store';
import { SectionTitle } from '../../../../shared/ui/section-title/section-title';
import { OccasionFilter } from '../occasion-filter/occasion-filter';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'app-most-popular',
  imports: [OccasionFilter, ProductCard, RouterLink, SectionTitle, LucideAngularModule, TranslatePipe],
  templateUrl: './most-popular.html',
  styleUrl: './most-popular.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MostPopular {
  private readonly store = inject(HomeStore);
  protected readonly ArrowRight = ArrowRight;
  protected readonly loading = this.store.popularLoading;
  protected readonly selectedId = this.store.selectedOccasionId;
  protected readonly occasions = this.store.occasions;
  protected readonly products = this.store.popular;
  protected onSelectOccasion(id: string | null): void {
    this.store.selectOccasion(id);
  }
  protected onAddToCart(product: Product): void {
    console.log('add to cart', product.id);
  }
}
