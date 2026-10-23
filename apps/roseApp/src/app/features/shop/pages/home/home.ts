import { Component } from '@angular/core';
import { BestSelling } from '../../components/best-sellings/best-selling';
import { MostPopular } from '../../components/most-popular/most-popular';
import { PromoBanners } from '../../components/promo-banners/promo-banners';
import { RelatedProducts } from '../../components/related-products/related-products';

@Component({
  selector: 'app-home',
  imports: [BestSelling,MostPopular,PromoBanners,RelatedProducts],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
