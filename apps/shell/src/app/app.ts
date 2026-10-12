import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService, ThemeToggle } from '@org/theme';
import { NxWelcome } from './nx-welcome';

@Component({
  imports: [NxWelcome, RouterModule, ThemeToggle],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'shell';

  constructor() {
    inject(ThemeService);
  }
}
