import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  AlertCircle,
  HeartPlus,
  LucideAngularModule,
  Package,
  ShoppingCart,
  Star,
} from 'lucide-angular';
import { CarouselModule } from 'primeng/carousel';
import {
  CarouselPageEvent,
  CarouselResponsiveOptions,
} from 'primeng/types/carousel';
import { Product } from '../../../shop/interfaces/home.model/home-model-response';
import { Spinner } from '@org/ui';
import {
  GalleryItem,
  ProductDetailsState,
} from '../../modules/prodect-deatils.model';
import { ProductsService } from '../../services/products.service';
import { ProductReviews } from '../../../shop/components/product-reviews/product-reviews';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CarouselModule,
    DecimalPipe,
    LucideAngularModule,
    Spinner,
    TranslatePipe,
    ProductReviews,
  ],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly productsService = inject(ProductsService);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  // Lucide icons
  protected readonly PackageIcon = Package;
  protected readonly StarIcon = Star;
  protected readonly HeartIcon = HeartPlus;
  protected readonly CartIcon = ShoppingCart;
  protected readonly AlertCircleIcon = AlertCircle;

  // Carousel responsive configuration
  protected readonly thumbBreakpoints: CarouselResponsiveOptions[] = [
    { breakpoint: '1400px', numVisible: 7, numScroll: 1 },
    { breakpoint: '1024px', numVisible: 6, numScroll: 1 },
    { breakpoint: '768px', numVisible: 5, numScroll: 1 },
    { breakpoint: '480px', numVisible: 4, numScroll: 1 },
  ];

  readonly status = signal<ProductDetailsState>('loading');
  readonly product = signal<Product | null>(null);
  readonly errorMessage = signal<string | null>(null);

  // Gallery carousel active slide synchronization
  readonly activePage = signal<number>(0);
  readonly thumbPage = signal<number>(0);

  private readonly productId = signal<string | null>(null);
  readonly resolvedProductId = computed(() => this.productId());

  readonly images = computed<string[]>(() => {
    const p = this.product();
    if (!p) return [];
    return this.parseGallery(p.cover, p.gallery);
  });

  readonly galleryItems = computed<GalleryItem[]>(() =>
    this.images().map((url, index) => ({ url, index })),
  );

  readonly thumbNumVisible = computed(() =>
    Math.max(1, Math.min(this.images().length, 7)),
  );

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const id = params.get('id') ?? this.route.snapshot?.paramMap?.get('id');
        if (id) {
          this.productId.set(id);
          this.fetchProduct(id);
        } else {
          this.productId.set(null);
          this.status.set('missing-id');
          this.product.set(null);
        }
      });
  }

  fetchProduct(id: string | null): void {
    if (!id) {
      return;
    }
    this.status.set('loading');
    this.errorMessage.set(null);

    this.productsService
      .getProduct(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res?.payload?.product) {
            this.product.set(res.payload.product);
            this.status.set('success');
            this.activePage.set(0);
            this.thumbPage.set(0);
          } else {
            this.product.set(null);
            this.status.set('not-found');
          }
        },
        error: (err) => {
          this.product.set(null);
          if (err?.status === 404) {
            this.status.set('not-found');
          } else {
            this.status.set('error');
            this.errorMessage.set(err?.message || null);
          }
        },
      });
  }

  private parseGallery(
    cover?: string | null,
    gallery?: string | string[] | null,
  ): string[] {
    const images: string[] = [];

    const addImage = (candidate: unknown) => {
      if (typeof candidate !== 'string') return;
      const trimmed = candidate.trim();
      if (!trimmed || trimmed.startsWith('{') || trimmed.includes('{')) return;
      if (!images.includes(trimmed)) {
        images.push(trimmed);
      }
    };
    addImage(cover);
    if (Array.isArray(gallery)) {
      for (const item of gallery) {
        addImage(item);
      }
    } else if (typeof gallery === 'string') {
      const trimmed = gallery.trim();
      if (trimmed.startsWith('[')) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            addImage(item);
          }
        }
      } else {
        addImage(trimmed);
      }
    }

    return images;
  }

  selectImage(index: number): void {
    if (index >= 0 && index < this.images().length) {
      this.activePage.set(index);
    }
  }

  onMainPageChange(event: CarouselPageEvent): void {
    if (event.page !== undefined && event.page !== this.activePage()) {
      this.activePage.set(event.page);
    }
  }

  onThumbPageChange(event: CarouselPageEvent): void {
    if (event.page !== undefined) {
      this.thumbPage.set(event.page);
    }
  }
}
