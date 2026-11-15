import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { skipLoading } from '../../core/interceptors/loading.interceptor';
import {
  NotificationApiResponse,
  NotificationListPayload,
  NotificationListQuery,
  NOTIFICATIONS_ENDPOINTS,
  UnreadCountPayload,
  UpdateNotificationRequest,
} from './notifications.models';

@Injectable({
  providedIn: 'root',
})
export class NotificationsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}${NOTIFICATIONS_ENDPOINTS.BASE}`;

  list(
    query?: NotificationListQuery,
    context?: HttpContext,
  ): Observable<NotificationApiResponse<NotificationListPayload>> {
    return this.http.get<NotificationApiResponse<NotificationListPayload>>(
      this.baseUrl,
      {
        params: this.buildListParams(query),
        context: this.createContext(context),
      },
    );
  }

  unreadCount(
    context?: HttpContext,
  ): Observable<NotificationApiResponse<UnreadCountPayload>> {
    return this.http.get<NotificationApiResponse<UnreadCountPayload>>(
      `${environment.apiUrl}${NOTIFICATIONS_ENDPOINTS.UNREAD_COUNT}`,
      {
        context: this.createContext(context),
      },
    );
  }

  markRead(
    id: string,
    isRead = true,
    context?: HttpContext,
  ): Observable<NotificationApiResponse<unknown>> {
    const body: UpdateNotificationRequest = { isRead };
    return this.http.patch<NotificationApiResponse<unknown>>(
      `${this.baseUrl}/${encodeURIComponent(id)}`,
      body,
      {
        context: this.createContext(context),
      },
    );
  }

  delete(
    id: string,
    context?: HttpContext,
  ): Observable<NotificationApiResponse<unknown>> {
    return this.http.delete<NotificationApiResponse<unknown>>(
      `${this.baseUrl}/${encodeURIComponent(id)}`,
      {
        context: this.createContext(context),
      },
    );
  }

  markAllRead(
    context?: HttpContext,
  ): Observable<NotificationApiResponse<unknown>> {
    return this.http.patch<NotificationApiResponse<unknown>>(
      `${environment.apiUrl}${NOTIFICATIONS_ENDPOINTS.MARK_ALL_READ}`,
      {},
      {
        context: this.createContext(context),
      },
    );
  }

  clearAll(
    context?: HttpContext,
  ): Observable<NotificationApiResponse<unknown>> {
    return this.http.delete<NotificationApiResponse<unknown>>(
      `${environment.apiUrl}${NOTIFICATIONS_ENDPOINTS.CLEAR_ALL}`,
      {
        context: this.createContext(context),
      },
    );
  }

  private createContext(customContext?: HttpContext): HttpContext {
    return skipLoading(customContext);
  }

  private buildListParams(query?: NotificationListQuery): HttpParams {
    let params = new HttpParams();

    const page =
      query?.page !== undefined && !Number.isNaN(query.page)
        ? Math.max(1, Math.floor(Number(query.page)))
        : 1;
    params = params.set('page', page.toString());

    const limit =
      query?.limit !== undefined && !Number.isNaN(query.limit)
        ? Math.min(100, Math.max(1, Math.floor(Number(query.limit))))
        : 20;
    params = params.set('limit', limit.toString());

    if (query?.type) {
      params = params.set('type', query.type);
    }

    if (query?.isRead !== undefined && query.isRead !== null) {
      let isReadStr: string | null = null;
      if (typeof query.isRead === 'boolean') {
        isReadStr = query.isRead ? 'true' : 'false';
      } else if (['true', 'false', '1', '0'].includes(String(query.isRead))) {
        isReadStr = String(query.isRead);
      }
      if (isReadStr !== null) {
        params = params.set('isRead', isReadStr);
      }
    }

    if (query?.search !== undefined && query.search !== null) {
      const trimmed = query.search.trim();
      if (trimmed.length > 0) {
        params = params.set('search', trimmed.slice(0, 200));
      }
    }

    return params;
  }
}
