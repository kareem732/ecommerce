import { computed, effect, inject, untracked } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { NotificationService, SessionService } from '@org/auth-service';
import { finalize, take } from 'rxjs';
import { toErrorMessage } from '../auth/utils/with-request-state';
import { NotificationsApiService } from './notifications.service';
import {
  NotificationItem,
  NotificationMetadata,
  NotificationsState,
} from './notifications.models';

export const initialNotificationsState: NotificationsState = {
  items: [],
  metadata: null,
  unreadCount: 0,
  status: 'idle',
  error: null,
  pendingIds: [],
  isMarkingAllRead: false,
  isClearingAll: false,
  activeUserId: null,
};

export const NotificationsStore = signalStore(
  { providedIn: 'root' },
  withState(initialNotificationsState),

  withComputed(
    ({
      items,
      metadata,
      unreadCount,
      status,
      pendingIds,
      isMarkingAllRead,
      isClearingAll,
    }) => ({
      isLoading: computed(() => status() === 'loading'),
      isRefreshing: computed(() => status() === 'refreshing'),
      isError: computed(() => status() === 'error'),
      isSuccess: computed(() => status() === 'success'),
      currentPage: computed(() => metadata()?.page ?? 1),
      totalPages: computed(() => metadata()?.totalPages ?? 1),
      total: computed(() => metadata()?.total ?? 0),
      isEmpty: computed(() => status() === 'success' && items().length === 0),
      hasUnread: computed(() => unreadCount() > 0),
      hasPendingMutations: computed(
        () => pendingIds().length > 0 || isMarkingAllRead() || isClearingAll(),
      ),
    }),
  ),

  withMethods(
    (
      store,
      api = inject(NotificationsApiService),
      session = inject(SessionService),
      notifications = inject(NotificationService),
    ) => {
      let currentListRequestId = 0;
      let currentCountRequestId = 0;
      let countInFlight = false;

      const reset = (): void => {
        currentListRequestId++;
        currentCountRequestId++;
        countInFlight = false;
        patchState(store, {
          items: [],
          metadata: null,
          unreadCount: 0,
          status: 'idle',
          error: null,
          pendingIds: [],
          isMarkingAllRead: false,
          isClearingAll: false,
          activeUserId: null,
        });
      };

      const loadUnreadCount = (force = false): void => {
        if (countInFlight && !force) return;
        countInFlight = true;
        const reqId = ++currentCountRequestId;

        api
          .unreadCount()
          .pipe(
            finalize(() => {
              countInFlight = false;
            }),
          )
          .subscribe({
            next: (res) => {
              if (reqId !== currentCountRequestId) return;
              patchState(store, {
                unreadCount: res.payload?.unreadCount ?? 0,
              });
            },
          });
      };

      const loadPage = (page = 1, silent = false): void => {
        const reqId = ++currentListRequestId;
        const isRefresh = store.items().length > 0;

        if (!silent) {
          patchState(store, {
            status: isRefresh ? 'refreshing' : 'loading',
            error: null,
          });
        }

        api
          .list({ page, limit: 20 })
          .pipe(take(1))
          .subscribe({
            next: (res) => {
              if (reqId !== currentListRequestId) return;
              patchState(store, {
                items: res.payload?.data ?? [],
                metadata: res.payload?.metadata ?? null,
                status: 'success',
                error: null,
              });
            },
            error: (err: unknown) => {
              if (reqId !== currentListRequestId) return;
              patchState(store, {
                status: 'error',
                error: toErrorMessage(err),
              });
            },
          });
      };

      const openPanel = (): void => {
        if (store.status() === 'idle') {
          loadPage(1);
        }
      };

      const retry = (): void => {
        const page = store.metadata()?.page ?? 1;
        loadPage(page);
      };

      const markRead = (id: string): void => {
        if (store.pendingIds().includes(id)) return;
        const target = store.items().find((item) => item.id === id);
        if (target?.isRead) return;

        patchState(store, {
          pendingIds: [...store.pendingIds(), id],
        });

        api
          .markRead(id)
          .pipe(
            finalize(() => {
              patchState(store, {
                pendingIds: store.pendingIds().filter((pid) => pid !== id),
              });
            }),
          )
          .subscribe({
            next: () => {
              patchState(store, {
                items: store
                  .items()
                  .map((item) =>
                    item.id === id ? { ...item, isRead: true } : item,
                  ),
              });
              loadUnreadCount(true);
              const currentPage = store.metadata()?.page ?? 1;
              loadPage(currentPage, true);
            },
            error: (err: unknown) => {
              notifications.error(toErrorMessage(err));
            },
          });
      };

      const deleteNotification = (id: string): void => {
        if (store.pendingIds().includes(id)) return;

        patchState(store, {
          pendingIds: [...store.pendingIds(), id],
        });

        api
          .delete(id)
          .pipe(
            finalize(() => {
              patchState(store, {
                pendingIds: store.pendingIds().filter((pid) => pid !== id),
              });
            }),
          )
          .subscribe({
            next: () => {
              const meta = store.metadata();
              const currentPage = meta?.page ?? 1;
              const isOnlyItemOnNonFirstPage =
                store.items().length <= 1 && currentPage > 1;
              const targetPage = isOnlyItemOnNonFirstPage
                ? currentPage - 1
                : currentPage;

              loadUnreadCount(true);
              loadPage(targetPage, true);
            },
            error: (err: unknown) => {
              notifications.error(toErrorMessage(err));
            },
          });
      };

      const markAllRead = (): void => {
        if (store.isMarkingAllRead() || store.unreadCount() === 0) return;

        patchState(store, { isMarkingAllRead: true });

        api
          .markAllRead()
          .pipe(
            finalize(() => {
              patchState(store, { isMarkingAllRead: false });
            }),
          )
          .subscribe({
            next: () => {
              patchState(store, {
                unreadCount: 0,
                items: store.items().map((item) => ({ ...item, isRead: true })),
              });
              loadUnreadCount(true);
              const currentPage = store.metadata()?.page ?? 1;
              loadPage(currentPage, true);
            },
            error: (err: unknown) => {
              notifications.error(toErrorMessage(err));
            },
          });
      };

      const clearAll = (): void => {
        const meta = store.metadata();
        const total = meta?.total ?? store.items().length;
        if (store.isClearingAll() || total === 0) return;

        patchState(store, { isClearingAll: true });

        api
          .clearAll()
          .pipe(
            finalize(() => {
              patchState(store, { isClearingAll: false });
            }),
          )
          .subscribe({
            next: () => {
              patchState(store, {
                items: [],
                unreadCount: 0,
                metadata: { page: 1, limit: 20, total: 0, totalPages: 1 },
                status: 'success',
              });
              loadUnreadCount(true);
            },
            error: (err: unknown) => {
              notifications.error(toErrorMessage(err));
            },
          });
      };

      const initSessionListener = (): void => {
        effect(() => {
          const loggedIn = session.isLoggedIn();
          const user = session.user();
          const userId = user?.id ?? (loggedIn ? 'authenticated' : null);

          untracked(() => {
            if (!loggedIn || !userId) {
              if (store.activeUserId() !== null) {
                reset();
              }
            } else if (store.activeUserId() !== userId) {
              reset();
              patchState(store, { activeUserId: userId });
              loadUnreadCount(true);
            }
          });
        });
      };

      return {
        reset,
        loadUnreadCount,
        loadPage,
        openPanel,
        retry,
        markRead,
        delete: deleteNotification,
        markAllRead,
        clearAll,
        initSessionListener,
      };
    },
  ),

  withHooks({
    onInit(store) {
      store.initSessionListener();
    },
  }),
);
