import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { map, startWith } from 'rxjs';
import { SectionTitle } from '../../../../shared/ui/section-title/section-title';

@Component({
  selector: 'app-gallery',
  imports: [TranslatePipe, SectionTitle],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class Gallery {
  private readonly translate = inject(TranslateService);

  readonly currentLanguage = toSignal(
    this.translate.onLangChange.pipe(
      map((e) => e.lang),
      startWith(this.translate.getCurrentLang() || 'en'),
    ),
    { initialValue: this.translate.getCurrentLang() || 'en' },
  );
}
