import { Component } from '@angular/core';
import { BestSelling } from '../../components/best-sellings/best-selling';
import { MostPopular } from '../../components/most-popular/most-popular';
import { RelatedProducts } from '../../components/related-products/related-products';
import { TrustedCompanies } from '../../components/trusted-companies/trusted-companies';

@Component({
  selector: 'app-home',
  imports: [BestSelling, MostPopular, RelatedProducts, TrustedCompanies],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
