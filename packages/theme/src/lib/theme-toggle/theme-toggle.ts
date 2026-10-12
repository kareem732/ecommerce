import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { LucideAngularModule, Moon, Sun } from 'lucide-angular';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggle {
  private themeService = inject(ThemeService);

  readonly Sun = Sun;
  readonly Moon = Moon;

  isDark = computed(() => this.themeService.theme() === 'dark');

  toggle(): void {
    this.themeService.toggle();
  }
}
