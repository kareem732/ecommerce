import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AuthUser, NotificationService, SessionService } from '@org/auth-service';
import { of, Subject, throwError } from 'rxjs';
import { NotificationsApiService } from './notifications.service';
import {
  NotificationApiResponse,
  NotificationItem,
  NotificationListPayload,
  UnreadCountPayload,
} from './notifications.models';
import { NotificationsStore } from './notifications.store';

describe('NotificationsStore', () => {
  let store: InstanceType<typeof NotificationsStore>;
  let apiMock: {
    list: ReturnType<typeof vi.fn>;
    unreadCount: ReturnType<typeof vi.fn>;
    markRead: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    markAllRead: ReturnType<typeof vi.fn>;
    clearAll: ReturnType<typeof vi.fn>;
  };
  let sessionMock: {
    isLoggedIn: ReturnType<typeof signal<boolean>>;
    user: ReturnType<typeof signal<AuthUser | null>>;
  };
  let notificationServiceMock: {
    error: ReturnType<typeof vi.fn>;
    success: ReturnType<typeof vi.fn>;
  };

  const mockItem1: NotificationItem = {
    id: 'notif-1',
    userId: 'user-1',
    type: 'ORDER',
    title: 'Order confirmed',
    message: 'Your order was placed successfully',
    isRead: false,
    link: null,
    createdAt: '2026-11-14T10:00:00Z',
    updatedAt: '2026-11-14T10:00:00Z',
  };

  const mockItem2: NotificationItem = {
    id: 'notif-2',
    userId: 'user-1',
    type: 'PROMOTION',
    title: 'Sale starts now',
    message: '50% off all roses',
    isRead: true,
    link: '/shop',
    createdAt: '2026-11-14T09:00:00Z',
    updatedAt: '2026-11-14T09:00:00Z',
  };

  beforeEach(() => {
    apiMock = {
      list: vi.fn().mockReturnValue(
        of({
          status: true,
          code: 200,
          payload: {
            data: [mockItem1, mockItem2],
            metadata: { page: 1, limit: 20, total: 2, totalPages: 1 },
          },
        } as NotificationApiResponse<NotificationListPayload>),
      ),
      unreadCount: vi.fn().mockReturnValue(
        of({
          status: true,
          code: 200,
          payload: { unreadCount: 1 },
        } as NotificationApiResponse<UnreadCountPayload>),
      ),
      markRead: vi.fn().mockReturnValue(
        of({ status: true, code: 200, payload: {} }),
      ),
      delete: vi.fn().mockReturnValue(
        of({ status: true, code: 200, payload: {} }),
      ),
      markAllRead: vi.fn().mockReturnValue(
        of({ status: true, code: 200, payload: {} }),
      ),
      clearAll: vi.fn().mockReturnValue(
        of({ status: true, code: 200, payload: {} }),
      ),
    };

    sessionMock = {
      isLoggedIn: signal(false),
      user: signal(null),
    };

    notificationServiceMock = {
      error: vi.fn(),
      success: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        NotificationsStore,
        { provide: NotificationsApiService, useValue: apiMock },
        { provide: SessionService, useValue: sessionMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });

    store = TestBed.inject(NotificationsStore);
  });

  describe('initial state', () => {
    it('has correct default values', () => {
      expect(store.items()).toEqual([]);
      expect(store.metadata()).toBeNull();
      expect(store.unreadCount()).toBe(0);
      expect(store.status()).toBe('idle');
      expect(store.error()).toBeNull();
      expect(store.isLoading()).toBe(false);
      expect(store.isRefreshing()).toBe(false);
      expect(store.hasUnread()).toBe(false);
      expect(store.isEmpty()).toBe(false);
    });
  });

  describe('loadUnreadCount', () => {
    it('fetches unreadCount and updates signal', () => {
      store.loadUnreadCount();

      expect(apiMock.unreadCount).toHaveBeenCalled();
      expect(store.unreadCount()).toBe(1);
      expect(store.hasUnread()).toBe(true);
    });

    it('deduplicates concurrent unreadCount requests while in flight', () => {
      const subject = new Subject<NotificationApiResponse<UnreadCountPayload>>();
      apiMock.unreadCount.mockReturnValue(subject.asObservable());

      store.loadUnreadCount();
      store.loadUnreadCount();

      expect(apiMock.unreadCount).toHaveBeenCalledTimes(1);

      subject.next({ status: true, code: 200, payload: { unreadCount: 5 } });
      subject.complete();

      expect(store.unreadCount()).toBe(5);
    });
  });

  describe('openPanel and loadPage', () => {
    it('loads page 1 when openPanel is called in idle state', () => {
      store.openPanel();

      expect(apiMock.list).toHaveBeenCalledWith({ page: 1, limit: 20 });
      expect(store.status()).toBe('success');
      expect(store.items()).toEqual([mockItem1, mockItem2]);
      expect(store.metadata()).toEqual({ page: 1, limit: 20, total: 2, totalPages: 1 });
      expect(store.currentPage()).toBe(1);
      expect(store.totalPages()).toBe(1);
      expect(store.total()).toBe(2);
      expect(store.isEmpty()).toBe(false);
    });

    it('sets status to refreshing on subsequent page loads when items exist', () => {
      store.openPanel();
      expect(store.status()).toBe('success');

      apiMock.list.mockReturnValue(
        of({
          status: true,
          code: 200,
          payload: {
            data: [mockItem1],
            metadata: { page: 2, limit: 20, total: 2, totalPages: 2 },
          },
        }),
      );

      store.loadPage(2);
      expect(apiMock.list).toHaveBeenCalledWith({ page: 2, limit: 20 });
      expect(store.currentPage()).toBe(2);
    });

    it('correctly reports isEmpty when list is empty and status is success', () => {
      apiMock.list.mockReturnValue(
        of({
          status: true,
          code: 200,
          payload: {
            data: [],
            metadata: { page: 1, limit: 20, total: 0, totalPages: 1 },
          },
        }),
      );

      store.openPanel();
      expect(store.isEmpty()).toBe(true);
      expect(store.items()).toEqual([]);
    });
  });

  describe('failure preservation and retry', () => {
    it('preserves prior items and metadata on failure and marks status as error', () => {
      store.openPanel();
      expect(store.items().length).toBe(2);

      apiMock.list.mockReturnValue(throwError(() => new Error('Server connection lost')));
      store.loadPage(1);

      expect(store.status()).toBe('error');
      expect(store.error()).toBe('Server connection lost');
      expect(store.items().length).toBe(2);
      expect(store.isEmpty()).toBe(false);
    });

    it('retry re-attempts loading the current page', () => {
      apiMock.list.mockReturnValue(throwError(() => new Error('Network error')));
      store.openPanel();

      expect(store.status()).toBe('error');

      apiMock.list.mockReturnValue(
        of({
          status: true,
          code: 200,
          payload: {
            data: [mockItem1],
            metadata: { page: 1, limit: 20, total: 1, totalPages: 1 },
          },
        }),
      );

      store.retry();
      expect(store.status()).toBe('success');
      expect(store.items()).toEqual([mockItem1]);
    });
  });

  describe('stale response protection', () => {
    it('discards late responses from older requests', () => {
      apiMock.list.mockReturnValueOnce(
        of({
          status: true,
          code: 200,
          payload: {
            data: [mockItem1],
            metadata: { page: 1, limit: 20, total: 1, totalPages: 1 },
          },
        }),
      );

      store.loadPage(1);

      apiMock.list.mockReturnValueOnce(
        of({
          status: true,
          code: 200,
          payload: {
            data: [mockItem2],
            metadata: { page: 2, limit: 20, total: 2, totalPages: 2 },
          },
        }),
      );
      store.loadPage(2);

      expect(store.currentPage()).toBe(2);
      expect(store.items()).toEqual([mockItem2]);
    });
  });

  describe('mutations', () => {
    beforeEach(() => {
      store.openPanel();
    });

    describe('markRead', () => {
      it('marks an unread item as read and refreshes count and list', () => {
        const readItem1 = { ...mockItem1, isRead: true };
        apiMock.list.mockReturnValue(
          of({
            status: true,
            code: 200,
            payload: {
              data: [readItem1, mockItem2],
              metadata: { page: 1, limit: 20, total: 2, totalPages: 1 },
            },
          }),
        );
        apiMock.unreadCount.mockReturnValue(
          of({ status: true, code: 200, payload: { unreadCount: 0 } }),
        );

        store.markRead('notif-1');

        expect(apiMock.markRead).toHaveBeenCalledWith('notif-1');
        expect(store.items().find((i) => i.id === 'notif-1')?.isRead).toBe(true);
        expect(apiMock.unreadCount).toHaveBeenCalled();
        expect(store.unreadCount()).toBe(0);
      });

      it('ignores already read items', () => {
        apiMock.markRead.mockClear();
        store.markRead('notif-2'); // already isRead: true

        expect(apiMock.markRead).not.toHaveBeenCalled();
      });

      it('prevents concurrent markRead calls for the same item while in flight', () => {
        const subject = new Subject<NotificationApiResponse<unknown>>();
        apiMock.markRead.mockReturnValue(subject.asObservable());

        store.markRead('notif-1');
        store.markRead('notif-1');

        expect(apiMock.markRead).toHaveBeenCalledTimes(1);

        subject.next({ status: true, code: 200, payload: {} });
        subject.complete();
      });
    });

    describe('delete', () => {
      it('deletes an item and refreshes count and current page', () => {
        store.delete('notif-1');

        expect(apiMock.delete).toHaveBeenCalledWith('notif-1');
        expect(apiMock.unreadCount).toHaveBeenCalled();
        expect(apiMock.list).toHaveBeenCalled();
      });

      it('navigates to previous page if last item on non-first page was deleted', () => {
        apiMock.list.mockReturnValue(
          of({
            status: true,
            code: 200,
            payload: {
              data: [mockItem1],
              metadata: { page: 3, limit: 20, total: 21, totalPages: 3 },
            },
          }),
        );
        store.loadPage(3);
        apiMock.list.mockClear();

        store.delete('notif-1');

        expect(apiMock.delete).toHaveBeenCalledWith('notif-1');
        // Because items.length was 1 and page was 3, target page is 2
        expect(apiMock.list).toHaveBeenCalledWith({ page: 2, limit: 20 });
      });

      it('prevents concurrent delete calls for the same item while in flight', () => {
        const subject = new Subject<NotificationApiResponse<unknown>>();
        apiMock.delete.mockReturnValue(subject.asObservable());

        store.delete('notif-1');
        store.delete('notif-1');

        expect(apiMock.delete).toHaveBeenCalledTimes(1);

        subject.next({ status: true, code: 200, payload: {} });
        subject.complete();
      });
    });

    describe('markAllRead', () => {
      it('marks all items read and sets unreadCount to 0', () => {
        store.loadUnreadCount();
        expect(store.unreadCount()).toBe(1);

        const readItem1 = { ...mockItem1, isRead: true };
        apiMock.list.mockReturnValue(
          of({
            status: true,
            code: 200,
            payload: {
              data: [readItem1, mockItem2],
              metadata: { page: 1, limit: 20, total: 2, totalPages: 1 },
            },
          }),
        );
        apiMock.unreadCount.mockReturnValue(
          of({ status: true, code: 200, payload: { unreadCount: 0 } }),
        );

        store.markAllRead();

        expect(apiMock.markAllRead).toHaveBeenCalled();
        expect(store.unreadCount()).toBe(0);
        expect(store.items().every((i) => i.isRead)).toBe(true);
      });

      it('does nothing if unreadCount is 0', () => {
        apiMock.markAllRead.mockClear();
        apiMock.unreadCount.mockReturnValue(
          of({ status: true, code: 200, payload: { unreadCount: 0 } }),
        );
        store.loadUnreadCount();

        store.markAllRead();
        expect(apiMock.markAllRead).not.toHaveBeenCalled();
      });
    });

    describe('clearAll', () => {
      it('clears all items and resets unreadCount and metadata', () => {
        apiMock.unreadCount.mockReturnValue(
          of({ status: true, code: 200, payload: { unreadCount: 0 } }),
        );

        store.clearAll();

        expect(apiMock.clearAll).toHaveBeenCalled();
        expect(store.items()).toEqual([]);
        expect(store.unreadCount()).toBe(0);
        expect(store.total()).toBe(0);
      });

      it('does nothing if total is 0', () => {
        apiMock.list.mockReturnValue(
          of({
            status: true,
            code: 200,
            payload: {
              data: [],
              metadata: { page: 1, limit: 20, total: 0, totalPages: 1 },
            },
          }),
        );
        store.loadPage(1);
        apiMock.clearAll.mockClear();

        store.clearAll();
        expect(apiMock.clearAll).not.toHaveBeenCalled();
      });
    });
  });

  describe('reset and session changes', () => {
    it('resets all state when reset() is called', () => {
      store.openPanel();
      expect(store.items().length).toBeGreaterThan(0);

      store.reset();

      expect(store.items()).toEqual([]);
      expect(store.metadata()).toBeNull();
      expect(store.unreadCount()).toBe(0);
      expect(store.status()).toBe('idle');
      expect(store.error()).toBeNull();
      expect(store.pendingIds()).toEqual([]);
      expect(store.isMarkingAllRead()).toBe(false);
      expect(store.isClearingAll()).toBe(false);
    });

    it('discards late responses after reset', () => {
      apiMock.list.mockReturnValue(throwError(() => new Error('Late failure')));
      store.reset();

      expect(store.status()).toBe('idle');
      expect(store.error()).toBeNull();
    });
  });
});
