import { Component } from '@angular/core';
import { BestSelling } from '../../components/best-sellings/best-selling';
import { FeatureSection } from '../../components/feature-section/feature-section';
import { MostPopular } from '../../components/most-popular/most-popular';
import { PromoBanners } from '../../components/promo-banners/promo-banners';
import { Testimonials } from '../../components/testimonials/testimonials';
import { TrustedCompanies } from '../../components/trusted-companies/trusted-companies';
import { HomeStore } from '../../stores/home/home.store';
import { Gallery } from '../../components/gallery/gallery';
import { About } from '../../components/about/about';

@Component({
  selector: 'app-home',
  imports: [BestSelling, FeatureSection, MostPopular , PromoBanners , Testimonials, TrustedCompanies, Gallery, About],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  providers: [HomeStore],
})
export class Home {}
