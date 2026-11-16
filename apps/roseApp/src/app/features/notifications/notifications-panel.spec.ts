import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { OverlayModule, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { ConfirmationDialogService } from '../../shared/business/confirmation-dialog.service';
import { NotificationItem, NotificationMetadata } from './notifications.models';
import { NotificationsPanel } from './notifications-panel';
import { NotificationsStore } from './notifications.store';

describe('NotificationsPanel', () => {
  let component: NotificationsPanel;
  let fixture: ComponentFixture<NotificationsPanel>;

  let storeMock: {
    items: ReturnType<typeof signal<NotificationItem[]>>;
    metadata: ReturnType<typeof signal<NotificationMetadata | null>>;
    unreadCount: ReturnType<typeof signal<number>>;
    status: ReturnType<typeof signal<string>>;
    error: ReturnType<typeof signal<string | null>>;
    isLoading: ReturnType<typeof signal<boolean>>;
    isRefreshing: ReturnType<typeof signal<boolean>>;
    isError: ReturnType<typeof signal<boolean>>;
    isEmpty: ReturnType<typeof signal<boolean>>;
    currentPage: ReturnType<typeof signal<number>>;
    totalPages: ReturnType<typeof signal<number>>;
    total: ReturnType<typeof signal<number>>;
    isMarkingAllRead: ReturnType<typeof signal<boolean>>;
    isClearingAll: ReturnType<typeof signal<boolean>>;
    retry: ReturnType<typeof vi.fn>;
    loadPage: ReturnType<typeof vi.fn>;
    markRead: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    markAllRead: ReturnType<typeof vi.fn>;
    clearAll: ReturnType<typeof vi.fn>;
  };

  let confirmationServiceMock: {
    confirm: ReturnType<typeof vi.fn>;
  };

  let routerMock: {
    navigateByUrl: ReturnType<typeof vi.fn>;
  };

  const mockItem1: NotificationItem = {
    id: 'item-1',
    userId: 'user-1',
    type: 'ORDER',
    title: 'Order Completed',
    message: 'Your order was successfully delivered',
    isRead: false,
    link: '/orders/item-1',
    createdAt: '2026-11-14T10:00:00Z',
    updatedAt: '2026-11-14T10:00:00Z',
  };

  const mockItem2: NotificationItem = {
    id: 'item-2',
    userId: 'user-1',
    type: 'PROMOTION',
    title: 'Valentine Promo',
    message: 'Special discount on roses today',
    isRead: true,
    link: null,
    createdAt: '2026-11-14T09:00:00Z',
    updatedAt: '2026-11-14T09:00:00Z',
  };

  beforeEach(async () => {
    storeMock = {
      items: signal([mockItem1, mockItem2]),
      metadata: signal({ page: 1, limit: 20, total: 2, totalPages: 1 }),
      unreadCount: signal(1),
      status: signal('success'),
      error: signal(null),
      isLoading: signal(false),
      isRefreshing: signal(false),
      isError: signal(false),
      isEmpty: signal(false),
      currentPage: signal(1),
      totalPages: signal(1),
      total: signal(2),
      isMarkingAllRead: signal(false),
      isClearingAll: signal(false),
      retry: vi.fn(),
      loadPage: vi.fn(),
      markRead: vi.fn(),
      delete: vi.fn(),
      markAllRead: vi.fn(),
      clearAll: vi.fn(),
    };

    confirmationServiceMock = {
      confirm: vi.fn().mockResolvedValue(true),
    };

    routerMock = {
      navigateByUrl: vi.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [NotificationsPanel, OverlayModule],
      providers: [
        provideTranslateService(),
        { provide: NotificationsStore, useValue: storeMock },
        { provide: ConfirmationDialogService, useValue: confirmationServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('rendering states', () => {
    it('renders list of items when loaded with data', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Order Completed');
      expect(compiled.textContent).toContain('Valentine Promo');
      expect(compiled.querySelectorAll('li').length).toBe(2);
    });

    it('renders loading state when isLoading is true', () => {
      storeMock.isLoading.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('[role="status"]')).toBeTruthy();
      expect(compiled.querySelectorAll('li').length).toBe(0);
    });

    it('renders error state and retry button when isError is true', () => {
      storeMock.isError.set(true);
      storeMock.error.set('Failed to fetch data');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const alert = compiled.querySelector('[role="alert"]');
      expect(alert).toBeTruthy();
      expect(alert?.textContent).toContain('Failed to fetch data');

      const retryBtn = alert?.querySelector('button');
      retryBtn?.click();
      expect(storeMock.retry).toHaveBeenCalled();
    });

    it('renders empty state when isEmpty is true', () => {
      storeMock.isEmpty.set(true);
      storeMock.items.set([]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelectorAll('li').length).toBe(0);
      expect(compiled.querySelector('[role="status"]')).toBeFalsy();
      expect(compiled.querySelector('[role="alert"]')).toBeFalsy();
    });
  });

  describe('header and action strip', () => {
    it('emits close event when close button is clicked', () => {
      const closeSpy = vi.fn();
      component.close.subscribe(closeSpy);

      const closeBtn = fixture.nativeElement.querySelector('header button');
      closeBtn?.click();

      expect(closeSpy).toHaveBeenCalled();
    });

    it('calls markAllRead on mark all button click', () => {
      const markAllBtn = fixture.nativeElement.querySelectorAll('.notifications-panel > div button')[0];
      markAllBtn.click();

      expect(storeMock.markAllRead).toHaveBeenCalled();
    });

    it('disables markAllRead button when unreadCount is 0', () => {
      storeMock.unreadCount.set(0);
      fixture.detectChanges();

      const markAllBtn = fixture.nativeElement.querySelectorAll('.notifications-panel > div button')[0];
      expect(markAllBtn.disabled).toBe(true);
    });

    it('opens confirmation dialog on clearAll and calls store.clearAll when confirmed', async () => {
      await component.onClearAll();

      expect(confirmationServiceMock.confirm).toHaveBeenCalled();
      expect(storeMock.clearAll).toHaveBeenCalled();
    });

    it('does not call clearAll when confirmation dialog is cancelled', async () => {
      confirmationServiceMock.confirm.mockResolvedValueOnce(false);
      await component.onClearAll();

      expect(confirmationServiceMock.confirm).toHaveBeenCalled();
      expect(storeMock.clearAll).not.toHaveBeenCalled();
    });
  });

  describe('item interaction and menu', () => {
    it('marks unread item read and navigates when clicked', () => {
      const closeSpy = vi.fn();
      component.close.subscribe(closeSpy);

      component.onItemClick(mockItem1);

      expect(storeMock.markRead).toHaveBeenCalledWith('item-1');
      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/orders/item-1');
      expect(closeSpy).toHaveBeenCalled();
    });

    it('opens item actions menu when 3-dots trigger is clicked', () => {
      const mockTrigger = {} as unknown as CdkOverlayOrigin;
      const mockEl = document.createElement('button');

      component.openMenu('item-1', mockTrigger, mockEl);

      expect(component.activeMenuId()).toBe('item-1');
      expect(component.activeItem()).toEqual(mockItem1);
    });

    it('closes menu and returns focus on closeMenu', () => {
      const mockTrigger = {} as unknown as CdkOverlayOrigin;
      const mockEl = document.createElement('button');
      const focusSpy = vi.spyOn(mockEl, 'focus');

      component.openMenu('item-1', mockTrigger, mockEl);
      component.closeMenu();

      expect(component.activeMenuId()).toBeNull();
      expect(focusSpy).toHaveBeenCalled();
    });

    it('calls markRead and closes menu when onMarkRead is invoked', () => {
      component.activeMenuId.set('item-1');
      component.onMarkRead('item-1');

      expect(storeMock.markRead).toHaveBeenCalledWith('item-1');
      expect(component.activeMenuId()).toBeNull();
    });

    it('calls delete and closes menu when onDelete is invoked', () => {
      component.activeMenuId.set('item-1');
      component.onDelete('item-1');

      expect(storeMock.delete).toHaveBeenCalledWith('item-1');
      expect(component.activeMenuId()).toBeNull();
    });
  });

  describe('pagination', () => {
    it('renders pagination when total > 20 and calls loadPage on pageChange', () => {
      storeMock.total.set(45);
      fixture.detectChanges();

      const paginationEl = fixture.nativeElement.querySelector('app-pagination');
      expect(paginationEl).toBeTruthy();

      component.onPageChange(2);
      expect(storeMock.loadPage).toHaveBeenCalledWith(2);
    });

    it('does not render pagination when total <= 20', () => {
      storeMock.total.set(15);
      fixture.detectChanges();

      const paginationEl = fixture.nativeElement.querySelector('app-pagination');
      expect(paginationEl).toBeFalsy();
    });
  });
});
