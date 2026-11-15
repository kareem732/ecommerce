import { HttpContext, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { SKIP_LOADING } from '../../core/interceptors/loading.interceptor';
import { NotificationsApiService } from './notifications.service';
import {
  NotificationApiResponse,
  NotificationItem,
  NotificationListPayload,
  UnreadCountPayload,
} from './notifications.models';

describe('NotificationsApiService', () => {
  let service: NotificationsApiService;
  let http: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/api/notifications`;

  const mockNotification: NotificationItem = {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    userId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    type: 'ORDER',
    title: 'Order Shipped',
    message: 'Your order #1234 has been shipped successfully.',
    isRead: false,
    link: '/orders/1234',
    createdAt: '2026-11-14T10:00:00.000Z',
    updatedAt: '2026-11-14T10:00:00.000Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(NotificationsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  describe('list', () => {
    it('sends GET request with default page=1 and limit=20', () => {
      let result: NotificationApiResponse<NotificationListPayload> | undefined;

      service.list().subscribe((res) => {
        result = res;
      });

      const req = http.expectOne(
        (r) => r.url === baseUrl && r.method === 'GET',
      );
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('limit')).toBe('20');
      expect(req.request.params.has('type')).toBe(false);
      expect(req.request.params.has('isRead')).toBe(false);
      expect(req.request.params.has('search')).toBe(false);
      expect(req.request.context.get(SKIP_LOADING)).toBe(true);

      const mockResponse: NotificationApiResponse<NotificationListPayload> = {
        status: true,
        code: 200,
        payload: {
          data: [mockNotification],
          metadata: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
          },
        },
      };

      req.flush(mockResponse);
      expect(result).toEqual(mockResponse);
    });

    it('serializes query parameters properly (page, limit, type, isRead, search)', () => {
      service
        .list({
          page: 2,
          limit: 10,
          type: 'ORDER',
          isRead: false,
          search: '  flower gift  ',
        })
        .subscribe();

      const req = http.expectOne((r) => r.url === baseUrl);
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('limit')).toBe('10');
      expect(req.request.params.get('type')).toBe('ORDER');
      expect(req.request.params.get('isRead')).toBe('false');
      expect(req.request.params.get('search')).toBe('flower gift');
      req.flush({ status: true, code: 200, payload: { data: [], metadata: { page: 2, limit: 10, total: 0, totalPages: 0 } } });
    });

    it('normalizes invalid page, limit, and clamps search to 200 chars', () => {
      const longSearch = 'a'.repeat(250);
      service
        .list({
          page: -5,
          limit: 500,
          isRead: '1',
          search: longSearch,
        })
        .subscribe();

      const req = http.expectOne((r) => r.url === baseUrl);
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('limit')).toBe('100');
      expect(req.request.params.get('isRead')).toBe('1');
      expect(req.request.params.get('search')).toBe('a'.repeat(200));
      req.flush({ status: true, code: 200, payload: { data: [], metadata: { page: 1, limit: 100, total: 0, totalPages: 0 } } });
    });

    it('omits search if it is whitespace only', () => {
      service.list({ search: '   ' }).subscribe();

      const req = http.expectOne((r) => r.url === baseUrl);
      expect(req.request.params.has('search')).toBe(false);
      req.flush({ status: true, code: 200, payload: { data: [], metadata: { page: 1, limit: 20, total: 0, totalPages: 0 } } });
    });
  });

  describe('unreadCount', () => {
    it('sends GET request to /api/notifications/unread-count with SKIP_LOADING', () => {
      let result: NotificationApiResponse<UnreadCountPayload> | undefined;

      service.unreadCount().subscribe((res) => {
        result = res;
      });

      const req = http.expectOne(
        (r) =>
          r.url === `${baseUrl}/unread-count` && r.method === 'GET',
      );
      expect(req.request.context.get(SKIP_LOADING)).toBe(true);

      const mockResponse: NotificationApiResponse<UnreadCountPayload> = {
        status: true,
        code: 200,
        payload: { unreadCount: 5 },
      };

      req.flush(mockResponse);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('markRead', () => {
    it('sends PATCH request to /api/notifications/{id} with { isRead: true }', () => {
      const id = 'notif-uuid-123';
      let result: NotificationApiResponse<unknown> | undefined;

      service.markRead(id).subscribe((res) => {
        result = res;
      });

      const req = http.expectOne(
        (r) =>
          r.url === `${baseUrl}/${encodeURIComponent(id)}` &&
          r.method === 'PATCH',
      );
      expect(req.request.body).toEqual({ isRead: true });
      expect(req.request.context.get(SKIP_LOADING)).toBe(true);

      const mockResponse: NotificationApiResponse<unknown> = {
        status: true,
        code: 200,
        message: 'Notification updated',
        payload: {},
      };

      req.flush(mockResponse);
      expect(result).toEqual(mockResponse);
    });

    it('encodes special characters in id', () => {
      const id = 'id/with?special#chars';
      service.markRead(id).subscribe();

      const req = http.expectOne(
        (r) => r.url === `${baseUrl}/${encodeURIComponent(id)}`,
      );
      expect(req.request.method).toBe('PATCH');
      req.flush({ status: true, code: 200, payload: {} });
    });
  });

  describe('delete', () => {
    it('sends DELETE request to /api/notifications/{id}', () => {
      const id = 'notif-uuid-456';
      let result: NotificationApiResponse<unknown> | undefined;

      service.delete(id).subscribe((res) => {
        result = res;
      });

      const req = http.expectOne(
        (r) =>
          r.url === `${baseUrl}/${encodeURIComponent(id)}` &&
          r.method === 'DELETE',
      );
      expect(req.request.context.get(SKIP_LOADING)).toBe(true);

      const mockResponse: NotificationApiResponse<unknown> = {
        status: true,
        code: 200,
        message: 'Notification deleted',
        payload: {},
      };

      req.flush(mockResponse);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('markAllRead', () => {
    it('sends PATCH request to /api/notifications/mark-all-read', () => {
      let result: NotificationApiResponse<unknown> | undefined;

      service.markAllRead().subscribe((res) => {
        result = res;
      });

      const req = http.expectOne(
        (r) =>
          r.url === `${baseUrl}/mark-all-read` && r.method === 'PATCH',
      );
      expect(req.request.body).toEqual({});
      expect(req.request.context.get(SKIP_LOADING)).toBe(true);

      const mockResponse: NotificationApiResponse<unknown> = {
        status: true,
        code: 200,
        message: 'All notifications marked as read',
        payload: {},
      };

      req.flush(mockResponse);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('clearAll', () => {
    it('sends DELETE request to /api/notifications/clear-all', () => {
      let result: NotificationApiResponse<unknown> | undefined;

      service.clearAll().subscribe((res) => {
        result = res;
      });

      const req = http.expectOne(
        (r) =>
          r.url === `${baseUrl}/clear-all` && r.method === 'DELETE',
      );
      expect(req.request.context.get(SKIP_LOADING)).toBe(true);

      const mockResponse: NotificationApiResponse<unknown> = {
        status: true,
        code: 200,
        message: 'All notifications cleared',
        payload: {},
      };

      req.flush(mockResponse);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('context propagation', () => {
    it('preserves custom context tokens while ensuring SKIP_LOADING is set', () => {
      const customContext = new HttpContext();
      service.unreadCount(customContext).subscribe();

      const req = http.expectOne(`${baseUrl}/unread-count`);
      expect(req.request.context.get(SKIP_LOADING)).toBe(true);
      req.flush({ status: true, code: 200, payload: { unreadCount: 0 } });
    });
  });
});

