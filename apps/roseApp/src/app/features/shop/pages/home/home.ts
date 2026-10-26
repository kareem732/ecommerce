import { Component } from '@angular/core';
import { BestSelling } from '../../components/best-sellings/best-selling';
import { FeatureSection } from '../../components/feature-section/feature-section';
import { MostPopular } from '../../components/most-popular/most-popular';
import { ProductReviews } from '../../components/product-reviews/product-reviews';
import { PromoBanners } from '../../components/promo-banners/promo-banners';
import { RelatedProducts } from '../../components/related-products/related-products';
import { Testimonials } from '../../components/testimonials/testimonials';
import { TrustedCompanies } from '../../components/trusted-companies/trusted-companies';
import { HomeStore } from '../../stores/home/home.store';

@Component({
  selector: 'app-home',
  imports: [BestSelling,FeatureSection,MostPopular,ProductReviews,PromoBanners,RelatedProducts,Testimonials,TrustedCompanies],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  providers: [HomeStore],
})
export class Home {}