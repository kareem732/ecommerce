import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Loading } from '@org/shared-loading';
import { ThemeService } from '@org/theme';
import { ToastHost } from '@org/ui';

@Component({
  imports: [RouterOutlet, Loading, ToastHost],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    class: 'block h-full w-full',
  },
})
export class App {
  constructor() {
    inject(ThemeService);
  }
}
