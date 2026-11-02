import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService, SessionService } from '@org/auth-service';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { CartItem, CartResponse } from '../../interfaces/cart.model/cart.model';
import { CartService } from '../../services/cart.service';

function sumQuantities(items: CartItem[]): number {
  return items.reduce((total, item) => total + (item.quantity ?? 1), 0);
}

function cartCountFrom(res: CartResponse): number {
  const payload = res?.payload;
  if (!payload) {
    return 0;
  }
  if (Array.isArray(payload)) {
    return sumQuantities(payload);
  }
  const items = payload.items ?? payload.data;
  if (Array.isArray(items)) {
    return sumQuantities(items);
  }
  return payload.totalQuantity ?? payload.totalItems ?? payload.count ?? 0;
}

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState({ count: 0 }),

  withMethods(
    (
      store,
      cart = inject(CartService),
      session = inject(SessionService),
      notifications = inject(NotificationService),
      translate = inject(TranslateService),
      router = inject(Router),
      destroyRef = inject(DestroyRef),
    ) => ({
      loadCart: rxMethod<void>(
        pipe(
          switchMap(() =>
            cart.getCart().pipe(
              tap((res) => patchState(store, { count: cartCountFrom(res) })),
              catchError(() => EMPTY),
            ),
          ),
        ),
      ),

      addToCart(productId: string): void {
        if (!session.isLoggedIn()) {
          router.navigate(['/auth/login'], {
            queryParams: { returnUrl: router.url },
          });
          return;
        }

        cart
          .addToCart({ productId, quantity: 1 })
          .pipe(
            switchMap(() => cart.getCart()),
            takeUntilDestroyed(destroyRef),
          )
          .subscribe({
            next: (res) => {
              patchState(store, { count: cartCountFrom(res) });
              notifications.success(translate.instant('SHOP.CART.ADDED'));
            },
            error: () =>
              notifications.error(translate.instant('SHOP.CART.ADD_ERROR')),
          });
      },
    }),
  ),

  withHooks({
    onInit(store) {
      const session = inject(SessionService);
      if (session.isLoggedIn()) {
        store.loadCart();
      }
    },
  }),
);
