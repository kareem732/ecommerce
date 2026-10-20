import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500">
      <p>© {{ currentYear }} Rose. All rights reserved.</p>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  readonly currentYear = new Date().getFullYear();
}
