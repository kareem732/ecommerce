import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastHost } from '@org/ui';
import { Navbar } from '../../core/components/navbar/navbar';
import { Footer } from '../../core/components/footer/footer';
@Component({
  selector: 'app-shop',
  imports: [RouterOutlet, ToastHost, Navbar, Footer],
  templateUrl: './shop.html',
  styleUrl: './shop.scss',
})
export class Shop {}
