import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LoginService, SessionService } from '@org/auth-service';
import { LanguageEnum, LanguageService } from '@org/shared-i18n';
import { ThemeService } from '@org/theme';
import {
  EllipsisVertical,
  Flower2,
  Languages,
  LogOut,
  LucideAngularModule,
  Menu,
  Moon,
  Sun,
  User,
} from 'lucide-angular';
import {
  ADMIN_NAV_ITEMS,
  LOGIN_ROUTE,
  ROSE_LOGO,
  STOREFRONT_HOME,
  STOREFRONT_PROFILE,
} from './admin-nav';

@Component({
  selector: 'app-admin-layout',
  imports: [
    NgTemplateOutlet,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    LucideAngularModule,
  ],
  templateUrl: './admin-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block h-dvh w-full',
    '(document:keydown.escape)': 'closeMenus()',
  },
})
export class AdminLayout {
  private readonly session = inject(SessionService);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);
  protected readonly language = inject(LanguageService);

  protected readonly navItems = ADMIN_NAV_ITEMS;
  /** Bottom bar on mobile: two links, the preview button, then the other two. */
  protected readonly navStart = ADMIN_NAV_ITEMS.slice(0, 2);
  protected readonly navEnd = ADMIN_NAV_ITEMS.slice(2);

  protected readonly logo = ROSE_LOGO;
  protected readonly storefrontHome = STOREFRONT_HOME;
  protected readonly profileRoute = STOREFRONT_PROFILE;

  protected readonly icons = { EllipsisVertical, Flower2, Languages, LogOut, Menu, Moon, Sun, User };

  private readonly themeService = inject(ThemeService);
  protected readonly isDark = computed(() => this.themeService.theme() === 'dark');

  protected readonly user = this.session.user;
  protected readonly fullName = computed(() => {
    const user = this.user();
    return user ? `${user.firstName} ${user.lastName}`.trim() : '';
  });
  protected readonly initials = computed(() => {
    const user = this.user();
    return user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : '';
  });

  protected readonly userMenuOpen = signal(false);
  protected readonly mobileMenuOpen = signal(false);

  protected toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
  }

  protected openMobileMenu(): void {
    this.mobileMenuOpen.set(true);
  }

  protected closeMenus(): void {
    this.userMenuOpen.set(false);
    this.mobileMenuOpen.set(false);
  }

  protected toggleTheme(): void {
    this.themeService.toggle();
  }

  protected toggleLanguage(): void {
    const next =
      this.language.currentLang() === LanguageEnum.Arabic ? LanguageEnum.English : LanguageEnum.Arabic;
    this.language.changeLanguage(next);
  }

  protected logout(): void {
    this.closeMenus();
    this.loginService.logout();
    void this.router.navigateByUrl(LOGIN_ROUTE);
  }
}
