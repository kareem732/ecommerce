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
import { TranslatePipe } from '@ngx-translate/core';
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
import { NavItem } from './navbar.model';
import { NAVBAR_NAVIGATION_LINKS } from './navbar.control';
import {
  INITIAL_PRODUCT_SEARCH_STATE,
  ProductSearchService,
} from '../../../features/shop/services/product-search.service';
import { SearchResults } from '../../../shared/business/search-results/search-results';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    LucideAngularModule,
    SearchResults,
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
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly productSearch = inject(ProductSearchService);
  private readonly searchBox = viewChild<ElementRef<HTMLElement>>('searchBox');
  private readonly wishlist = inject(WishlistStore);
  private readonly cart = inject(CartStore);

  readonly notificationCount = input<number>(0);
  readonly deliveryLocation = input<string | null>(null);

  readonly searchSubmit = output<string>();

  readonly isAccountMenuOpen = signal(false);
  readonly isMobileMenuOpen = signal(false);
  readonly searchQuery = signal('');
  readonly isSearchOpen = signal(false);
  readonly isMobileSearchOpen = signal(false);

  private readonly searchQuery$ = toObservable(this.searchQuery, {
    injector: this.injector,
  });
  private readonly isSearchActive = computed(
    () => this.isSearchOpen() || this.isMobileSearchOpen(),
  );

  // The catalog is only requested the first time either search (desktop box or mobile drawer) is opened.
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

  readonly wishlistCount = computed(() => this.wishlist.count());

  // Badge يتحدث تلقائي من الـ CartStore (بيتصفر لما المستخدم يعمل logout).
  // لو عاوز مجموع الكميات بدل عدد المنتجات استخدم this.cart.totalQuantity()
  readonly cartCount = computed(() =>
    this.isLoggedIn() ? this.cart.count() : 0,
  );

  readonly currentLang = computed(() => this.languageService.currentLang());
  readonly isRTL = computed(() => this.languageService.isRTL());
  readonly isDarkMode = computed(() => this.themeService.theme() === 'dark');

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
    // Keep the page behind the mobile search drawer from scrolling.
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
        });
      }
    });
  }

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
      this.isMobileSearchOpen.set(false);
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
  }

  openSearch(): void {
    this.isAccountMenuOpen.set(false);
    this.isMobileMenuOpen.set(false);
    this.isSearchOpen.set(true);
  }

  openMobileSearch(input: HTMLInputElement): void {
    this.closeAllMenus();
    this.isMobileSearchOpen.set(true);
    // The drawer is invisible until this change is rendered, so focus after it.
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

    // Enter opens the top match, once the results reflect what was typed.
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
    } else if (!this.searchBox()?.nativeElement.contains(target)) {
      this.isSearchOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAllMenus();
  }
}
