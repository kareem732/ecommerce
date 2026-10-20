import { Component } from '@angular/core';
import { BestSelling } from '../../components/best-sellings/best-selling';
import { MostPopular } from '../../components/most-popular/most-popular';

@Component({
  selector: 'app-home',
  imports: [BestSelling,MostPopular],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
