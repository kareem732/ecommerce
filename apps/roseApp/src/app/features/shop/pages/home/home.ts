import { Component } from '@angular/core';
import { BestSelling } from '../../components/best-sellings/best-selling';
import { MostPopular } from '../../components/most-popular/most-popular';
import { RelatedProducts } from '../../components/related-products/related-products';
// TEMP: for testing the reviews section until the product details page is ready. Remove before committing.
import { ProductReviews } from '../../components/product-reviews/product-reviews';

@Component({
  selector: 'app-home',
  imports: [BestSelling,MostPopular,RelatedProducts,ProductReviews],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
