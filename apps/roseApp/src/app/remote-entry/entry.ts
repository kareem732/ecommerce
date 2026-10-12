import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService, LanguageEnum } from '@org/shared-i18n';

@Component({
  imports: [RouterOutlet, TranslatePipe],
  selector: 'app-rose-app-entry',
  template: `
    <div [dir]="language.direction()">
      <div style="display:flex;align-items:center;gap:8px;padding:8px">
        <span>{{ 'COMMON.HOME' | translate }}</span>
        <span>—</span>
        <span>{{ titleObj.text | translate }}</span>
        <button
          type="button"
          [disabled]="language.loading()"
          (click)="toggleLanguage()"
        >
          {{ 'COMMON.SWITCH_LANGUAGE' | translate }}
        </button>
      </div>
      <router-outlet></router-outlet>
    </div>`,
})
export class RemoteEntry {
  readonly language = inject(LanguageService);

  readonly titleObj = { text: 'NAVIGATION.DASHBOARD' };

  toggleLanguage(): void {
    const next =
      this.language.currentLang() === LanguageEnum.Arabic
        ? LanguageEnum.English
        : LanguageEnum.Arabic;
    this.language.changeLanguage(next);
  }
}
