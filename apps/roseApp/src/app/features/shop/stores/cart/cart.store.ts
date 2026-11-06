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
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { ShopService } from '../../services/shop.service';
import { finalPrice } from '../../../../shared/utils/product-price';
import { initialState } from './cart.state';


export const CartStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed(({ items }) => ({
    count: computed(() => items().length),
    totalQuantity: computed(() =>
      items().reduce((sum, item) => sum + item.quantity, 0),
    ),
    subtotal: computed(() =>
      items().reduce(
        (sum, item) => sum + finalPrice(item.product) * item.quantity,
        0,
      ),
    ),
  })),

  withMethods(
    (
      store,
      api = inject(ShopService),
      notifications = inject(NotificationService),
    ) => {
      const setQuantity = (cartItemId: string, quantity: number): void => {
        patchState(store, {
          items: store
            .items()
            .map((item) =>
              item.id === cartItemId ? { ...item, quantity } : item,
            ),
        });
      };

      const load = rxMethod<void>(
        pipe(
          tap(() => patchState(store, { status: 'loading' })),
          switchMap(() =>
            api.getCart().pipe(
              tap(({ payload }) =>
                patchState(store, {
                  items: payload?.cartItems ?? [],
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

      const add = (productId: string, quantity = 1): void => {
        api.addToCart({ productId, quantity }).subscribe({
          next: (res) => {
            if (!res?.message) notifications.success('SHOP.CART.ADDED');
            load();
          },
          error: () => undefined,
        });
      };

      const updateQuantity = (cartItemId: string, quantity: number): void => {
        if (quantity < 1) return;

        const target = store.items().find((item) => item.id === cartItemId);
        if (!target) return;

        const previousQuantity = target.quantity;
        setQuantity(cartItemId, quantity);

        api.updateItemQuantity(cartItemId, { quantity }).subscribe({
          error: () => setQuantity(cartItemId, previousQuantity),
        });
      };

      const remove = (cartItemId: string): void => {
        const previous = store.items();
        const index = previous.findIndex((item) => item.id === cartItemId);
        if (index === -1) return;

        const target = previous[index];
        patchState(store, {
          items: previous.filter((item) => item.id !== cartItemId),
        });

        api.removeItemFromCart(cartItemId).subscribe({
          error: () => {
            const current = store.items();
            if (!current.some((item) => item.id === target.id)) {
              const restored = [...current];
              restored.splice(Math.min(index, restored.length), 0, target);
              patchState(store, { items: restored });
            }
          },
        });
      };

      const clear = (): void => {
        const previous = store.items();
        patchState(store, { items: [] });

        api.clearCart().subscribe({
          error: () => patchState(store, { items: previous }),
        });
      };

      return { load, add, updateQuantity, remove, clear };
    },
  ),
);
