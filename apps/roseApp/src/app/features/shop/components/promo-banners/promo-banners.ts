import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroSlider } from './hero-slider/hero-slider';
import { PromoCard } from './promo-card/promo-card';
import {
  HERO_AUTOPLAY_INTERVAL,
  HERO_SLIDES,
  OCCASION_BANNERS,
  SPECIAL_GIFTS_BANNER,
} from './promo-banners.constants';

@Component({
  selector: 'app-promo-banners',
  imports: [HeroSlider, PromoCard],
  templateUrl: './promo-banners.html',
  styleUrl: './promo-banners.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromoBanners {
  protected readonly specialGifts = SPECIAL_GIFTS_BANNER;
  protected readonly heroSlides = HERO_SLIDES;
  protected readonly occasions = OCCASION_BANNERS;
  protected readonly autoplayInterval = HERO_AUTOPLAY_INTERVAL;
}
