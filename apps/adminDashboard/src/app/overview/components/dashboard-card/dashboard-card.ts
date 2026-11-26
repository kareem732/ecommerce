import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-dashboard-card',
  imports: [TranslatePipe, Button],
  templateUrl: './dashboard-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full min-w-0' },
})
export class DashboardCard {
  readonly title = input.required<string>();
  readonly loading = input(false);
  readonly empty = input(false);
  readonly error = input(false);
  readonly centerTitle = input(false);

  readonly retry = output<void>();
}
