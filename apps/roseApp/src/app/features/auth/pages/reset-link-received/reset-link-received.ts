import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-link-received',
  imports: [RouterLink],
  templateUrl: './reset-link-received.html',
  styleUrl: './reset-link-received.scss',
})
export class ResetLinkReceived {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly email = signal<string>(this.resolveEmail());

  constructor() {
    if (!this.email()) {
      this.router.navigate(['../forget-password'], { relativeTo: this.route });
    }
  }

  private resolveEmail(): string {
    const email = history.state?.['email'] as string | undefined;
    return email?.trim() ?? '';
  }
}
