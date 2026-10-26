import { Component, inject } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { ArrowRight, Check, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-about',
  imports: [LucideAngularModule, TranslatePipe],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  readonly check = Check
  readonly arrowRight = ArrowRight;
  private translate = inject(TranslateService)

  currentLanguage: string = this.translate.getCurrentLang() || 'en';
}
