import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService, LanguageEnum } from '@org/shared-i18n';
import { ThemeService } from '@org/theme';

@Component({
  imports: [RouterOutlet, ],
  selector: 'app-rose-app-entry',
  host: {
    class: 'block h-full w-full',
  },
  template: `
    <div [dir]="language.direction()" class="h-full w-full">
      <router-outlet></router-outlet>
    </div>
    `,
})
export class RemoteEntry {
  readonly language = inject(LanguageService);
  private readonly themeService = inject(ThemeService);

  readonly titleObj = { text: 'NAVIGATION.DASHBOARD' };

  toggleLanguage(): void {
    const next =
      this.language.currentLang() === LanguageEnum.Arabic
        ? LanguageEnum.English
        : LanguageEnum.Arabic;
    this.language.changeLanguage(next);
  }
}
