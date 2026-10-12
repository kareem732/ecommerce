import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '@org/shared-i18n';
import { RouterOutlet } from '@angular/router';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-auth',
  imports: [RouterOutlet, ImageModule, TranslatePipe],
  templateUrl: './auth.html',
})
export class Auth {
  readonly language = inject(LanguageService);
}
