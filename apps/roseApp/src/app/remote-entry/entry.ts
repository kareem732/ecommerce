import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LanguageService, LanguageEnum } from '@org/shared-i18n';

@Component({
  imports: [RouterOutlet, TranslatePipe, Toast],
  providers: [MessageService],
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
      <p-toast />
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
