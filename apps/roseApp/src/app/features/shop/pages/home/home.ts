import { Component } from '@angular/core';
import { BestSelling } from '../../components/best-sellings/best-selling';
import { FeatureSection } from '../../components/feature-section/feature-section';
import { MostPopular } from '../../components/most-popular/most-popular';
import { RelatedProducts } from '../../components/related-products/related-products';

@Component({
  selector: 'app-home',
  imports: [BestSelling,FeatureSection,MostPopular,RelatedProducts],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
