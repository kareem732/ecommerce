export type NotificationType =
  'ORDER' | 'PROMOTION' | 'SYSTEM' | 'REVIEW' | 'OTHER';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NotificationListPayload {
  data: NotificationItem[];
  metadata: NotificationMetadata;
}

export interface NotificationApiResponse<T = unknown> {
  status: boolean;
  code: number;
  message?: string;
  payload: T;
}

export interface UnreadCountPayload {
  unreadCount: number;
}

export type NotificationIsReadFilter = 'true' | 'false' | '1' | '0';

export interface NotificationListQuery {
  page?: number;
  limit?: number;
  type?: NotificationType;
  isRead?: NotificationIsReadFilter | boolean;
  search?: string;
}

export interface UpdateNotificationRequest {
  isRead: boolean;
}

export const NOTIFICATIONS_ENDPOINTS = {
  BASE: '/api/notifications',
  UNREAD_COUNT: '/api/notifications/unread-count',
  MARK_ALL_READ: '/api/notifications/mark-all-read',
  CLEAR_ALL: '/api/notifications/clear-all',
} as const;

export type NotificationStatus =
  'idle' | 'loading' | 'refreshing' | 'success' | 'error';

export interface NotificationsState {
  items: NotificationItem[];
  metadata: NotificationMetadata | null;
  unreadCount: number;
  status: NotificationStatus;
  error: string | null;
  pendingIds: string[];
  isMarkingAllRead: boolean;
  isClearingAll: boolean;
  activeUserId: string | null;
}
