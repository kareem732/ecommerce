import { Component } from '@angular/core';
import { BestSelling } from '../../components/best-sellings/best-selling';

@Component({
  selector: 'app-home',
  imports: [BestSelling],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
