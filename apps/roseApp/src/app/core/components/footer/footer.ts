import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';
import { FooterService } from './footer.service';
import { FooterLink } from './footer.model';
import { FOOTER_NAVIGATION_LINKS } from './footer.control';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslatePipe, LucideAngularModule],
  templateUrl: './footer.html',
})
export class Footer {
  private readonly footerService = inject(FooterService);
  private readonly destroyRef = inject(DestroyRef);

  readonly currentYear = new Date().getFullYear();
  readonly ArrowRight = ArrowRight;

  readonly email = signal('');
  readonly emailError = signal<string | null>(null);
  readonly isSubscribed = signal(false);

  readonly navLinks: FooterLink[] = FOOTER_NAVIGATION_LINKS;

  onEmailInput(value: string): void {
    this.email.set(value);
    if (this.emailError()) {
      this.emailError.set(null);
    }
  }

  onSubscribe(event: Event): void {
    event.preventDefault();
    this.emailError.set(null);

    this.footerService
      .subscriptionEmail({ email: this.email() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubscribed.set(true);
          this.email.set('');
        },
        error: () => {
          this.isSubscribed.set(false);
          this.emailError.set('FOOTER.INVALID_EMAIL');
        },
      });
  }
}
