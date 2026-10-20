import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  Bell,
  ChevronDown,
  ClipboardList,
  Gift,
  Headphones,
  Heart,
  House,
  Info,
  LogOut,
  LucideAngularModule,
  MapPin,
  MapPinHouse,
  Menu,
  Moon,
  PartyPopper,
  ScrollText,
  Search,
  Settings,
  ShoppingCart,
  Sun,
  User,
  X,
} from 'lucide-angular';
import { AuthUser, LoginService, SessionService } from '@org/auth-service';
import { LanguageEnum, LanguageService } from '@org/shared-i18n';
import { ThemeService } from '@org/theme';

export interface NavItem {
  id: string;
  labelKey: string;
  route: string;
  icon: typeof House;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe, LucideAngularModule],
  templateUrl: './navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  private readonly sessionService = inject(SessionService);
  private readonly loginService = inject(LoginService);
  private readonly languageService = inject(LanguageService);
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  // Inputs
  readonly cartCount = input<number>(0);
  readonly notificationCount = input<number>(0);
  readonly deliveryLocation = input<string | null>(null);

  // Outputs
  readonly searchSubmit = output<string>();

  // State signals
  readonly isAccountMenuOpen = signal(false);
  readonly isMobileMenuOpen = signal(false);
  readonly searchQuery = signal('');

  // Authentication & User state derived from SessionService
  readonly isLoggedIn = computed(() => this.sessionService.isLoggedIn());
  readonly user = computed<AuthUser | null>(() => this.sessionService.user());

  readonly displayName = computed<string>(() => {
    const u = this.user();
    if (!u) return '';
    return u.firstName || u.username || 'User';
  });

  readonly fullName = computed<string>(() => {
    const u = this.user();
    if (!u) return '';
    const parts = [u.firstName, u.lastName].filter(Boolean);
    return parts.length ? parts.join(' ') : u.username || 'User';
  });

  readonly userLocation = computed<string | null>(() => {
    if (this.deliveryLocation()) return this.deliveryLocation();
    const u = this.user();
    if (!u) return null;
    return (
      (u as unknown as { city?: string }).city ||
      (u as unknown as { address?: { city?: string } }).address?.city ||
      (u as unknown as { deliveryLocation?: string }).deliveryLocation ||
      null
    );
  });

  readonly isAdmin = computed<boolean>(() => this.user()?.role === 'ADMIN');

  // I18n and Theme state
  readonly currentLang = computed(() => this.languageService.currentLang());
  readonly isRTL = computed(() => this.languageService.isRTL());
  readonly isDarkMode = computed(() => this.themeService.theme() === 'dark');

  // Lucide Icons exposed to template
  readonly Search = Search;
  readonly MapPin = MapPin;
  readonly MapPinHouse = MapPinHouse;
  readonly User = User;
  readonly ChevronDown = ChevronDown;
  readonly Heart = Heart;
  readonly ShoppingCart = ShoppingCart;
  readonly Bell = Bell;
  readonly House = House;
  readonly Gift = Gift;
  readonly ClipboardList = ClipboardList;
  readonly PartyPopper = PartyPopper;
  readonly Headphones = Headphones;
  readonly Info = Info;
  readonly Settings = Settings;
  readonly ScrollText = ScrollText;
  readonly LogOut = LogOut;
  readonly Menu = Menu;
  readonly X = X;
  readonly Sun = Sun;
  readonly Moon = Moon;

  // Primary navigation items
  readonly navItems: NavItem[] = [
    { id: 'home', labelKey: 'NAV.HOME', route: '/shop/home', icon: House },
    { id: 'products', labelKey: 'NAV.PRODUCTS', route: '/shop/home', icon: Gift },
    { id: 'categories', labelKey: 'NAV.CATEGORIES', route: '/shop/home', icon: ClipboardList },
    { id: 'occasions', labelKey: 'NAV.OCCASIONS', route: '/shop/home', icon: PartyPopper },
    { id: 'contact', labelKey: 'NAV.CONTACT', route: '/shop/home', icon: Headphones },
    { id: 'about', labelKey: 'NAV.ABOUT', route: '/shop/home', icon: Info },
  ];

  toggleAccountMenu(): void {
    this.isAccountMenuOpen.update((open) => !open);
    if (this.isAccountMenuOpen()) {
      this.isMobileMenuOpen.set(false);
    }
  }

  closeAccountMenu(): void {
    this.isAccountMenuOpen.set(false);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open);
    if (this.isMobileMenuOpen()) {
      this.isAccountMenuOpen.set(false);
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  closeAllMenus(): void {
    this.isAccountMenuOpen.set(false);
    this.isMobileMenuOpen.set(false);
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
  }

  onSearchSubmit(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    const query = this.searchQuery().trim();
    this.searchSubmit.emit(query);
  }

  onWishlistClick(): void {
    this.closeAllMenus();
    if (this.isLoggedIn()) {
      this.router.navigate(['/shop/home']);
    } else {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/shop/home' },
      });
    }
  }

  onCartClick(): void {
    this.closeAllMenus();
    if (this.isLoggedIn()) {
      this.router.navigate(['/shop/home']);
    } else {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/shop/home' },
      });
    }
  }

  onNotificationClick(): void {
    this.closeAllMenus();
    this.router.navigate(['/shop/home']);
  }

  onAccountMenuNavigate(targetRoute: string): void {
    this.closeAllMenus();
    this.router.navigate([targetRoute]);
  }

  toggleLanguage(): void {
    const nextLang =
      this.languageService.currentLang() === LanguageEnum.Arabic
        ? LanguageEnum.English
        : LanguageEnum.Arabic;
    this.languageService.changeLanguage(nextLang);
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  logout(): void {
    this.closeAllMenus();
    this.loginService.logout();
    this.router.navigate(['/auth/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.closeAllMenus();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAllMenus();
  }
}
