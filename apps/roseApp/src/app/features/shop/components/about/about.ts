import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { ArrowRight, Check, LucideAngularModule } from 'lucide-angular';
import { map, startWith } from 'rxjs';

@Component({
  selector: 'app-about',
  imports: [LucideAngularModule, TranslatePipe],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  readonly check = Check;
  readonly arrowRight = ArrowRight;
  private readonly translate = inject(TranslateService);

  readonly currentLanguage = toSignal(
    this.translate.onLangChange.pipe(
      map((e) => e.lang),
      startWith(this.translate.getCurrentLang() || 'en'),
    ),
    { initialValue: this.translate.getCurrentLang() || 'en' },
  );
}
