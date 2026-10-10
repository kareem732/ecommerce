import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  imports: [RouterOutlet,Toast],
  providers: [MessageService],
  selector: 'app-rose-app-entry',
  template: `<p-toast /> <router-outlet></router-outlet>`,
})
export class RemoteEntry {}
