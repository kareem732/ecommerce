import { Component } from '@angular/core';
import { BestSelling } from '../../components/best-sellings/best-selling';
import { FeatureSection } from '../../components/feature-section/feature-section';
import { MostPopular } from '../../components/most-popular/most-popular';
import { PromoBanners } from '../../components/promo-banners/promo-banners';
import { RelatedProducts } from '../../components/related-products/related-products';
import { Testimonials } from '../../components/testimonials/testimonials';
import { TrustedCompanies } from '../../components/trusted-companies/trusted-companies';
import { ProductReviews } from '../../components/product-reviews/product-reviews';

@Component({
  selector: 'app-home',
  imports: [BestSelling,FeatureSection,MostPopular,PromoBanners,RelatedProducts,Testimonials,TrustedCompanies,ProductReviews],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}