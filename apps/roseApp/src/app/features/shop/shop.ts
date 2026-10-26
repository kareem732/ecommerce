import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastHost } from '@org/ui';
@Component({
  selector: 'app-shop',
  imports: [RouterOutlet, ToastHost],
  templateUrl: './shop.html',
  styleUrl: './shop.scss',
})
export class Shop {}
