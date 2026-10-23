import { Component } from '@angular/core';
import { BestSelling } from '../../components/best-sellings/best-selling';
import { MostPopular } from '../../components/most-popular/most-popular';
import { RelatedProducts } from '../../components/related-products/related-products';
import { Testimonials } from '../../components/testimonials/testimonials';

@Component({
  selector: 'app-home',
  imports: [BestSelling, MostPopular, RelatedProducts, Testimonials],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
