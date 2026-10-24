import { Component, inject } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-gallery',
  imports: [TranslatePipe],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class Gallery {
  private translate = inject(TranslateService)

  currentLanguage: string = this.translate.getCurrentLang() || 'en';
}
