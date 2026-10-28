import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AlertCircle, HeartPlus, LucideAngularModule, Package, ShoppingCart, Star } from 'lucide-angular';
import { CarouselModule } from 'primeng/carousel';
import { CarouselPageEvent, CarouselResponsiveOptions } from 'primeng/types/carousel';
import { map } from 'rxjs';
import { Spinner } from '@org/ui';
import { ProductReviews } from '../../components/product-reviews/product-reviews';
import { ProductDetailsStore } from '../../stores/product-details/product-details.store';
import { RelatedProducts } from '../../components/related-products/related-products';

@Component({
  selector: 'app-product-details',
  imports: [CarouselModule, DecimalPipe, LucideAngularModule, Spinner, TranslatePipe, ProductReviews, RelatedProducts],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ProductDetailsStore],
})
export class ProductDetails {
  protected readonly store = inject(ProductDetailsStore);
  private readonly route = inject(ActivatedRoute);

  protected readonly PackageIcon = Package;
  protected readonly StarIcon = Star;
  protected readonly HeartIcon = HeartPlus;
  protected readonly CartIcon = ShoppingCart;
  protected readonly AlertCircleIcon = AlertCircle;

  protected readonly thumbBreakpoints = computed<CarouselResponsiveOptions[]>(() => {
    const count = this.store.images().length;
    const cap = (n: number) => Math.max(1, Math.min(count, n));
    return [
      { breakpoint: '1400px', numVisible: cap(7), numScroll: 1 },
      { breakpoint: '1024px', numVisible: cap(6), numScroll: 1 },
      { breakpoint: '768px', numVisible: cap(5), numScroll: 1 },
      { breakpoint: '480px', numVisible: cap(4), numScroll: 1 },
    ];
  });

  private readonly productId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: null },
  );

  constructor() {
    this.store.load(this.productId);
  }

  protected onMainPageChange(event: CarouselPageEvent): void {
    if (event.page !== undefined) this.store.selectImage(event.page);
  }

  protected onThumbPageChange(event: CarouselPageEvent): void {
    if (event.page !== undefined) this.store.setThumbPage(event.page);
  }
}