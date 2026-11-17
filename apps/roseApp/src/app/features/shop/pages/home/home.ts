import { Component, inject } from '@angular/core';
import { scrollToFragmentWhenReady } from '../../../../shared/utils/scroll-to-fragment';
import { BestSelling } from '../../components/best-sellings/best-selling';
import { FeatureSection } from '../../components/feature-section/feature-section';
import { MostPopular } from '../../components/most-popular/most-popular';
import { PromoBanners } from '../../components/promo-banners/promo-banners';
import { Testimonials } from '../../components/testimonials/testimonials';
import { TrustedCompanies } from '../../components/trusted-companies/trusted-companies';
import { HomeStore } from '../../stores/home/home.store';
import { Gallery } from '../../components/gallery/gallery';
import { About } from '../../components/about/about';
import { GiftFinderBanner } from '../../../gift-finder/components/gift-finder-banner/gift-finder-banner';

@Component({
  selector: 'app-home',
  imports: [BestSelling, FeatureSection, MostPopular , PromoBanners , Testimonials, TrustedCompanies, Gallery, About, GiftFinderBanner],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  providers: [HomeStore],
})
export class Home {
  private readonly store = inject(HomeStore);

  constructor() {
    // The about section sits below async sections; wait for them before scrolling to #about.
    scrollToFragmentWhenReady(() => !this.store.popularLoading());
  }
}
