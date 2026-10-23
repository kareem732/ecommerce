import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChevronLeft, ChevronRight, LucideAngularModule } from 'lucide-angular';
import { CarouselModule } from 'primeng/carousel';
import { PromoCard } from '../promo-card/promo-card';
import { PromoBanner } from '../promo-banners.types';

@Component({
  selector: 'app-hero-slider',
  imports: [CarouselModule, PromoCard, LucideAngularModule],
  templateUrl: './hero-slider.html',
  styleUrl: './hero-slider.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSlider {
  private readonly translate = inject(TranslateService);

  readonly slides = input.required<PromoBanner[]>();
  /** Autoplay delay in ms. `0` disables autoplay. */
  readonly interval = input(5000);

  // PrimeNG's carousel only slides correctly in LTR, so the carousel is kept
  // LTR and each slide's content follows the current language instead.
  protected readonly slideDir = computed(() =>
    this.translate.currentLang() === 'ar' ? 'rtl' : 'ltr',
  );

  protected readonly ChevronLeft = ChevronLeft;
  protected readonly ChevronRight = ChevronRight;
}
