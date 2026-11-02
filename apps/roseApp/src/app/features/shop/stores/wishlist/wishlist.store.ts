import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { patchState,signalStore,withComputed,withMethods,withState} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { NotificationService } from '@org/auth-service';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { ShopService } from '../../services/shop.service';
import { initialState } from './wishlist.state';

export const WishlistStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed(({ items }) => ({
    count: computed(() => items().length),
    ids: computed(() => new Set(items().map((item) => item.productId))),
  })),

  withMethods(
    (
      store,
      api = inject(ShopService),
      notifications = inject(NotificationService),
    ) => {
      const load = rxMethod<void>(
        pipe(
          tap(() => patchState(store, { status: 'loading' })),
          switchMap(() =>
            api.getWishlist().pipe(
              tap(({ payload }) =>
                patchState(store, {
                  items: payload?.wishlistItems ?? [],
                  status: 'success',
                }),
              ),
              catchError(() => {
                patchState(store, { status: 'error' });
                return EMPTY;
              }),
            ),
          ),
        ),
      );

      const add = (productId: string): void => {
        api.addToWishlist({ productId }).subscribe({
          next: (res) => {
            if (!res?.message) notifications.success('WISHLIST.ADDED');
            load();
          },
          error: (err: HttpErrorResponse) => {
            if (err.status === 409) load();
          },
        });
      };

      const remove = (productId: string): void => {
        const previous = store.items();
        const target = previous.find((item) => item.productId === productId);
        if (!target) return;

        patchState(store, {
          items: previous.filter((item) => item.id !== target.id),
        });

        api.removeFromWishlist(target.id).subscribe({
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
