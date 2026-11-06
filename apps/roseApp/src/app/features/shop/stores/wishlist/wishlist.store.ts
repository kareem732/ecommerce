import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { NotificationService } from '@org/auth-service';
import { catchError, EMPTY, finalize, map, of, pipe, switchMap, tap } from 'rxjs';
import { ShopService } from '../../services/shop.service';
import { initialState } from './wishlist.state';

export const WishlistStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withState({ pendingIds: [] as string[] }),

  withComputed(({ items, pendingIds }) => ({
    count: computed(() => items().length),
    ids: computed(
      () =>
        new Set([
          ...items().map((item) => item.productId),
          ...pendingIds(),
        ]),
    ),
  })),

  withMethods(
    (
      store,
      api = inject(ShopService),
      notifications = inject(NotificationService),
    ) => {
      const inFlight = new Set<string>();

      const setPending = (productId: string, pending: boolean): void => {
        const rest = store.pendingIds().filter((id) => id !== productId);
        patchState(store, {
          pendingIds: pending ? [...rest, productId] : rest,
        });
      };

      const fetchItems$ = () =>
        api.getWishlist().pipe(
          tap(({ payload }) =>
            patchState(store, {
              items: payload?.wishlistItems ?? [],
              status: 'success',
            }),
          ),
        );

      const load = rxMethod<void>(
        pipe(
          tap(() => patchState(store, { status: 'loading' })),
          switchMap(() =>
            fetchItems$().pipe(
              catchError(() => {
                patchState(store, { status: 'error' });
                return EMPTY;
              }),
            ),
          ),
        ),
      );

      const add = (productId: string): void => {
        if (inFlight.has(productId) || store.ids().has(productId)) return;

        inFlight.add(productId);
        setPending(productId, true);

        api
          .addToWishlist({ productId })
          .pipe(
            switchMap((res) =>
              fetchItems$().pipe(
                catchError(() => of(null)),
                map(() => res),
              ),
            ),
            finalize(() => {
              setPending(productId, false);
              inFlight.delete(productId);
            }),
          )
          .subscribe({
            next: (res) => {
              if (!res?.message) notifications.success('WISHLIST.ADDED');
            },
            error: (err: HttpErrorResponse) => {
              if (err.status === 409) load();
            },
          });
      };

      const remove = (productId: string): void => {
        if (inFlight.has(productId)) return;

        const previous = store.items();
        const target = previous.find((item) => item.productId === productId);
        if (!target) return;

        inFlight.add(productId);
        patchState(store, {
          items: previous.filter((item) => item.id !== target.id),
        });

        api
          .removeFromWishlist(target.id)
          .pipe(finalize(() => inFlight.delete(productId)))
          .subscribe({
            error: () => patchState(store, { items: previous }),
          });
      };

      const clear = (): void => {
        const previous = store.items();
        patchState(store, { items: [] });

        api.clearWishlist().subscribe({
          error: () => patchState(store, { items: previous }),
        });
      };

      const toggle = (productId: string): void => {
        if (inFlight.has(productId)) return;

        if (store.ids().has(productId)) {
          remove(productId);
        } else {
          add(productId);
        }
      };

      return {
        load,
        add,
        remove,
        clear,
        toggle,
        has: (productId: string): boolean => store.ids().has(productId),
      };
    },
  ),
);
