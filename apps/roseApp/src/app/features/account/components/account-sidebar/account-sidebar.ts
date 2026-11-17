import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LoginService } from '@org/auth-service';
import { LogOut, LucideAngularModule } from 'lucide-angular';
import { ACCOUNT_NAV_ITEMS } from '../../constants/account.constants';

@Component({
  selector: 'app-account-sidebar',
  imports: [RouterLink, RouterLinkActive, TranslatePipe, LucideAngularModule],
  templateUrl: './account-sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountSidebar {
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);

  protected readonly items = ACCOUNT_NAV_ITEMS;
  protected readonly LogOut = LogOut;

  protected logout(): void {
    this.loginService.logout();
    this.router.navigate(['/auth/login']);
  }
}
