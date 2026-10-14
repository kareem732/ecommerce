import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-back-button',
  imports: [RouterLink, LucideAngularModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (link() !== null) {
      <a
        [routerLink]="link()"
        [relativeTo]="relativeTo()"
        class="inline-flex size-10 items-center justify-center rounded-full text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
        [attr.aria-label]="'COMMON.BACK' | translate"
      >
        <span class="inline-flex rtl:rotate-180">
          <lucide-icon [img]="ArrowLeft" [size]="22" />
        </span>
      </a>
    } @else {
      <button
        type="button"
        class="inline-flex size-10 items-center justify-center rounded-full text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
        [attr.aria-label]="'COMMON.BACK' | translate"
        (click)="clicked.emit()"
      >
        <span class="inline-flex rtl:rotate-180">
          <lucide-icon [img]="ArrowLeft" [size]="22" />
        </span>
      </button>
    }
  `,
})
export class BackButton {
  readonly link = input<string | unknown[] | null>(null);
  readonly relativeTo = input<ActivatedRoute | undefined>(undefined);
  readonly clicked = output<void>();

  protected readonly ArrowLeft = ArrowLeft;
}
