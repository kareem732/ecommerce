import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { CookieService, LoginService, SessionService, AuthUser } from '@org/auth-service';
import { LanguageService } from '@org/shared-i18n';
import { ThemeService } from '@org/theme';
import { NotificationsStore } from '../../../features/notifications/notifications.store';
import { Navbar } from './navbar';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  const userSignal = signal<AuthUser | null>(null);
  const isLoggedInSignal = signal<boolean>(false);
  const unreadCountSignal = signal<number>(0);

  const mockSessionService = {
    user: userSignal,
    isLoggedIn: isLoggedInSignal,
  };

  const mockCookieService = {
    get: vi.fn().mockReturnValue(''),
    set: vi.fn(),
    delete: vi.fn(),
  };

  const mockLoginService = {
    logout: vi.fn(),
  };

  const mockLanguageService = {
    currentLanguage: signal('ar'),
    isArabic: signal(true),
    setLanguage: vi.fn().mockReturnValue(of('en')),
  };

  const mockThemeService = {
    theme: signal('light'),
    toggle: vi.fn(),
  };

  const mockNotificationsStore = {
    unreadCount: unreadCountSignal,
    openPanel: vi.fn(),
    loadUnreadCount: vi.fn(),
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    userSignal.set(null);
    isLoggedInSignal.set(false);
    unreadCountSignal.set(0);
    mockNotificationsStore.openPanel.mockClear();
    mockNotificationsStore.loadUnreadCount.mockClear();
    mockCookieService.get.mockReset().mockReturnValue('');

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        provideRouter([]),
        { provide: SessionService, useValue: mockSessionService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: LoginService, useValue: mockLoginService },
        { provide: LanguageService, useValue: mockLanguageService },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: NotificationsStore, useValue: mockNotificationsStore },
      ],
    })
      .overrideComponent(Navbar, {
        set: {
          template: '<div></div>',
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('computes firstName from session user when available', () => {
    userSignal.set({
      id: '1',
      username: 'john_doe',
      email: 'john@example.com',
      phone: null,
      firstName: 'John',
      lastName: 'Doe',
      gender: 'MALE',
      emailVerified: true,
      phoneVerified: true,
      role: 'USER',
    });

    expect(component.firstName()).toBe('John');
    expect(component.fullName()).toBe('John Doe');
  });

  it('falls back to CookieService for firstName and lastName when user is not present', () => {
    mockCookieService.get.mockImplementation((key: string) => {
      if (key === 'firstName') return 'CookieFirst';
      if (key === 'lastName') return 'CookieLast';
      return '';
    });

    expect(component.firstName()).toBe('CookieFirst');
    expect(component.fullName()).toBe('CookieFirst CookieLast');
  });

  describe('notifications integration', () => {
    it('reflects unreadCount from NotificationsStore', () => {
      unreadCountSignal.set(5);
      expect(component.notificationCount()).toBe(5);
    });

    it('toggles isNotificationOpen and calls openPanel on notification click', () => {
      expect(component.isNotificationOpen()).toBe(false);

      component.onNotificationClick();
      expect(component.isNotificationOpen()).toBe(true);
      expect(mockNotificationsStore.openPanel).toHaveBeenCalled();

      component.onNotificationClick();
      expect(component.isNotificationOpen()).toBe(false);
    });

    it('closes notification panel on closeNotifications', () => {
      component.onNotificationClick();
      expect(component.isNotificationOpen()).toBe(true);

      component.closeNotifications();
      expect(component.isNotificationOpen()).toBe(false);
    });

    it('closes notification panel on closeAllMenus', () => {
      component.onNotificationClick();
      expect(component.isNotificationOpen()).toBe(true);

      component.closeAllMenus();
      expect(component.isNotificationOpen()).toBe(false);
    });

    it('closes notification panel when opening account menu', () => {
      component.onNotificationClick();
      expect(component.isNotificationOpen()).toBe(true);

      component.toggleAccountMenu();
      expect(component.isNotificationOpen()).toBe(false);
      expect(component.isAccountMenuOpen()).toBe(true);
    });

    it('closes notification panel when opening mobile menu', () => {
      component.onNotificationClick();
      expect(component.isNotificationOpen()).toBe(true);

      component.toggleMobileMenu();
      expect(component.isNotificationOpen()).toBe(false);
      expect(component.isMobileMenuOpen()).toBe(true);
    });

    it('closes notification panel on onEscape', () => {
      component.onNotificationClick();
      expect(component.isNotificationOpen()).toBe(true);

      component.onEscape();
      expect(component.isNotificationOpen()).toBe(false);
    });
  });
});
