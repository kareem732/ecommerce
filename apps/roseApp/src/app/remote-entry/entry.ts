import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-rose-app-entry',
  template: `<router-outlet></router-outlet>`,
})
export class RemoteEntry {}
