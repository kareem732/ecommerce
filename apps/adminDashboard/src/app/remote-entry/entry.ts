import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Root component when adminDashboard runs standalone (port 4201). */
@Component({
  imports: [RouterOutlet],
  selector: 'app-admin-dashboard-entry',
  host: { class: 'block h-full w-full' },
  template: `<router-outlet />`,
})
export class RemoteEntry {}
