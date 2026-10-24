import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../core/components/navbar/navbar';
import { Footer } from '../../core/components/footer/footer';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './shop.html',
  styleUrl: './shop.scss',
})
export class Shop {}
