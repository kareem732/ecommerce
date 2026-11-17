import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Injector,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
  untracked,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { first, switchMap } from 'rxjs';
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
import {
  AuthUser,
  CookieService,
  LoginService,
  SessionService,
} from '@org/auth-service';
import { LanguageEnum, LanguageService } from '@org/shared-i18n';
import { ThemeService } from '@org/theme';
import { CartStore } from '../../../features/shop/stores/cart/cart.store';
import { WishlistStore } from '../../../features/shop/stores/wishlist/wishlist.store';
import { AddressStore } from '../../../features/shop/stores/address/address.store';
import { MyAddressesModal } from '../../../features/shop/components/address/my-addresses-modal/my-addresses-modal';
import { NotificationsStore } from '../../../features/notifications/notifications.store';
import { NotificationsPanel } from '../../../features/notifications/notifications-panel';
import { NavItem } from './navbar.model';
import { NAVBAR_NAVIGATION_LINKS } from './navbar.control';
import {
  INITIAL_PRODUCT_SEARCH_STATE,
  ProductSearchService,
} from '../../../features/shop/services/product-search.service';
import { SearchResults } from '../../../shared/business/search-results/search-results';
import { AccountMenu, AccountMenuItem } from '@org/ui';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    LucideAngularModule,
    SearchResults,
    MyAddressesModal,
    NotificationsPanel,
    AccountMenu,
  ],
  templateUrl: './navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  private readonly sessionService = inject(SessionService);
  private readonly loginService = inject(LoginService);
  private readonly cookieService = inject(CookieService);
  private readonly languageService = inject(LanguageService);
  private readonly themeService = inject(ThemeService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly productSearch = inject(ProductSearchService);
  private readonly searchBox = viewChild<ElementRef<HTMLElement>>('searchBox');
  private readonly wishlist = inject(WishlistStore);
  private readonly cart = inject(CartStore);
  private readonly addressStore = inject(AddressStore);
  protected readonly notificationsStore = inject(NotificationsStore);

  private readonly ordersRoute = '/shop/order';

  readonly notificationCount = computed(() =>
    this.notificationsStore.unreadCount(),
  );
  readonly deliveryLocation = input<string | null>(null);

  readonly searchSubmit = output<string>();

  readonly isAccountMenuOpen = signal(false);
  readonly isMobileMenuOpen = signal(false);
  readonly isNotificationOpen = signal(false);
  readonly searchQuery = signal('');
  readonly isSearchOpen = signal(false);
  readonly isMobileSearchOpen = signal(false);
  readonly isAddressesOpen = signal(false);
  readonly startWithForm = signal(false);

  private readonly searchQuery$ = toObservable(this.searchQuery, {
    injector: this.injector,
  });
  private readonly isSearchActive = computed(
    () => this.isSearchOpen() || this.isMobileSearchOpen(),
  );

  readonly searchState = toSignal(
    toObservable(this.isSearchActive).pipe(
      first((open) => open),
      switchMap(() => this.productSearch.search(this.searchQuery$)),
    ),
    { initialValue: INITIAL_PRODUCT_SEARCH_STATE },
  );

  readonly isLoggedIn = computed(() => this.sessionService.isLoggedIn());
  readonly user = computed<AuthUser | null>(() => this.sessionService.user());

  readonly firstName = computed<string>(() => {
    const u = this.user();
    if (u?.firstName) return u.firstName;
    try {
      const stored = this.cookieService.get('firstName');
      if (stored) return stored;
    } catch {
      // Ignore
    }
    return u?.username || '';
  });

  readonly displayName = computed<string>(() => {
    return this.firstName() || this.user()?.username || 'User';
  });

  readonly fullName = computed<string>(() => {
    const u = this.user();
    if (u) {
      const parts = [u.firstName, u.lastName].filter(Boolean);
      if (parts.length) return parts.join(' ');
      if (u.username) return u.username;
    }
    try {
      const first = this.cookieService.get('firstName');
      const last = this.cookieService.get('lastName');
      const parts = [first, last].filter(Boolean);
      if (parts.length) return parts.join(' ');
    } catch {
      // Ignore
    }
    return 'User';
  });

  readonly selectedAddress = computed(() => this.addressStore.selectedAddress());

  readonly deliveryLabel = computed<string | null>(() => {
    if (!this.isLoggedIn()) return null;
    return this.selectedAddress()?.city ?? null;
  });

  readonly isAdmin = computed<boolean>(() => this.user()?.role === 'ADMIN');

  readonly wishlistCount = computed(() => this.wishlist.count());

  readonly cartCount = computed(() =>
    this.isLoggedIn() ? this.cart.count() : 0,
  );

  readonly currentLang = computed(() => this.languageService.currentLang());
  readonly isRTL = computed(() => this.languageService.isRTL());
  readonly isDarkMode = computed(() => this.themeService.theme() === 'dark');

  /** Account menu groups; re-computed when the language changes. */
  readonly accountGroups = computed<AccountMenuItem[][]>(() => {
    this.currentLang();
    const t = (key: string) => this.translate.instant(key);

    const main: AccountMenuItem[] = [
      { id: 'profile', label: t('HEADER.MY_PROFILE'), icon: User },
      { id: 'addresses', label: t('HEADER.MY_ADDRESSES'), icon: MapPinHouse },
      { id: 'orders', label: t('HEADER.MY_ORDERS'), icon: ScrollText },
    ];

    if (this.isAdmin()) {
      main.push({
        id: 'dashboard',
        label: t('HEADER.DASHBOARD'),
        icon: Settings,
      });
    }

    return [main, [{ id: 'logout', label: t('COMMON.LOGOUT'), icon: LogOut }]];
  });

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

  readonly navItems: NavItem[] = NAVBAR_NAVIGATION_LINKS;

  constructor() {
    effect(() => {
      this.document.body.classList.toggle(
        'overflow-hidden',
        this.isMobileSearchOpen(),
      );
    });

    effect(() => {
      if (this.isLoggedIn()) {
        untracked(() => {
          this.wishlist.load();
          this.cart.load();
          void this.addressStore.load();
          this.notificationsStore.loadUnreadCount();
        });
      } else {
        untracked(() => {
          this.addressStore.reset();
          this.isAddressesOpen.set(false);
        });
      }
    });
  }

  toggleAccountMenu(): void {
    this.isAccountMenuOpen.update((open) => !open);
    if (this.isAccountMenuOpen()) {
      this.isMobileMenuOpen.set(false);
      this.isNotificationOpen.set(false);
    }
  }

  closeAccountMenu(): void {
    this.isAccountMenuOpen.set(false);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open);
    if (this.isMobileMenuOpen()) {
      this.isAccountMenuOpen.set(false);
      this.isMobileSearchOpen.set(false);
      this.isNotificationOpen.set(false);
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  closeAllMenus(): void {
    this.isAccountMenuOpen.set(false);
    this.isMobileMenuOpen.set(false);
    this.isSearchOpen.set(false);
    this.isMobileSearchOpen.set(false);
    this.isNotificationOpen.set(false);
  }

  openAddresses(): void {
    this.closeAllMenus();

    if (!this.isLoggedIn()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    this.startWithForm.set(
      this.addressStore.count() === 0 && !this.addressStore.loading(),
    );
    this.isAddressesOpen.set(true);
  }

  openSearch(): void {
    this.isAccountMenuOpen.set(false);
    this.isMobileMenuOpen.set(false);
    this.isSearchOpen.set(true);
  }

  openMobileSearch(input: HTMLInputElement): void {
    this.closeAllMenus();
    this.isMobileSearchOpen.set(true);
    afterNextRender(() => input.focus(), { injector: this.injector });
  }

  closeMobileSearch(): void {
    this.isMobileSearchOpen.set(false);
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    this.isSearchOpen.set(true);
  }

  clearSearch(input: HTMLInputElement): void {
    this.searchQuery.set('');
    input.focus();
  }

  onSearchSubmit(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    const query = this.searchQuery().trim();
    this.searchSubmit.emit(query);

    const { term, products } = this.searchState();
    if (query && term && products.length) {
      this.router.navigate(['/shop/products', products[0].id]);
      this.onSearchResultSelected();
    }
  }

  onSearchResultSelected(): void {
    this.isSearchOpen.set(false);
    this.isMobileSearchOpen.set(false);
    this.searchQuery.set('');
  }

  onWishlistClick(): void {
    this.closeAllMenus();
    if (this.isLoggedIn()) {
      this.router.navigate(['/shop/wishlist']);
    } else {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/shop/wishlist' },
      });
    }
  }

  onCartClick(): void {
    this.closeAllMenus();
    if (this.isLoggedIn()) {
      this.router.navigate(['/shop/cart']);
    } else {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/shop/cart' },
      });
    }
  }

  onOrdersClick(): void {
    this.closeAllMenus();

    if (!this.isLoggedIn()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.ordersRoute },
      });
      return;
    }

    this.router.navigate([this.ordersRoute]);
  }

  onAccountItemSelected(item: AccountMenuItem): void {
    switch (item.id) {
      case 'profile':
        this.onAccountMenuNavigate('/shop/home');
        break;
      case 'addresses':
        this.openAddresses();
        break;
      case 'orders':
        this.onOrdersClick();
        break;
      case 'dashboard':
        this.onAccountMenuNavigate('/adminDashboard');
        break;
      case 'logout':
        this.logout();
        break;
    }
  }

  onNotificationClick(): void {
    const wasOpen = this.isNotificationOpen();
    this.closeAllMenus();
    if (!wasOpen) {
      this.isNotificationOpen.set(true);
      this.notificationsStore.openPanel();
    }
  }

  closeNotifications(): void {
    this.isNotificationOpen.set(false);
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
    const isInsideCdkOverlay = (target as Element)?.closest?.(
      '.cdk-overlay-container',
    );
    if (isInsideCdkOverlay) {
      return;
    }
    if (!this.elementRef.nativeElement.contains(target)) {
      this.closeAllMenus();
    } else if (!this.searchBox()?.nativeElement.contains(target)) {
      this.isSearchOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAllMenus();
  }
}