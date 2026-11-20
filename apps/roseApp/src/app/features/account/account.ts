import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AccountSidebar } from './components/account-sidebar/account-sidebar';

@Component({
  selector: 'app-account',
  imports: [RouterOutlet, TranslatePipe, AccountSidebar],
  templateUrl: './account.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Account {}
