import { Component } from '@angular/core';
import { BestSelling } from '../../components/best-sellings/best-selling';
import { FeatureSection } from '../../components/feature-section/feature-section';
import { MostPopular } from '../../components/most-popular/most-popular';
import { PromoBanners } from '../../components/promo-banners/promo-banners';
import { RelatedProducts } from '../../components/related-products/related-products';
import { Testimonials } from '../../components/testimonials/testimonials';
// TEMP: for testing the reviews section until the product details page is ready. Remove before committing.
import { ProductReviews } from '../../components/product-reviews/product-reviews';

@Component({
  selector: 'app-home',
  imports: [BestSelling, FeatureSection, MostPopular, PromoBanners, RelatedProducts, Testimonials,ProductReviews],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
