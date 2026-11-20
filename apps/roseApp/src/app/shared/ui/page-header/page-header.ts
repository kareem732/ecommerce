import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/** Page title (h1) with an optional subtitle, shared by storefront pages. */
@Component({
  selector: 'app-page-header',
  imports: [TranslatePipe],
  templateUrl: './page-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeader {
  readonly titleKey = input.required<string>();
  readonly subtitleKey = input<string | null>(null);
  readonly centered = input(false);
}
