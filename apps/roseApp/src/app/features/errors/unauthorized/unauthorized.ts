import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '@org/shared-i18n';
import { Button } from '@org/ui';
import { ArrowLeft, ArrowRight, House, LucideAngularModule, ShieldAlert } from 'lucide-angular';

const HOME_ROUTE = '/shop/home';

/** Shown when a logged-in user opens a page their role cannot access (e.g. the admin dashboard). */
@Component({
  selector: 'app-unauthorized',
  imports: [TranslatePipe, LucideAngularModule, Button],
  templateUrl: './unauthorized.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-h-dvh' },
})
export class Unauthorized {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  private readonly language = inject(LanguageService);

  protected readonly icons = { House, ShieldAlert };
  /** "Back" points to the start side: left in LTR, right in RTL. */
  protected readonly backIcon = computed(() => (this.language.isRTL() ? ArrowRight : ArrowLeft));

  /** When the URL was typed by hand there is no in-app page to return to, so fall back to home. */
  protected readonly canGoBack = typeof history !== 'undefined' && history.length > 1;

  protected goHome(): void {
    void this.router.navigateByUrl(HOME_ROUTE);
  }

  protected goBack(): void {
    this.location.back();
  }
}
