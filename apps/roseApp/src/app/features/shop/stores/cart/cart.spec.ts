import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@org/auth-service';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  makeCartItem,
  makeCartItemResponse,
  makeCartProduct,
  makeCartResponse,
} from '../../../../shared/utils/testing/cart.fixtures';
import {
  CartItem,
  CartItemResponse,
  CartMessageResponse,
  CartProduct,
  CartResponse,
} from '../../interfaces/cart.model/cart.model';
import { ShopService } from '../../services/shop.service';
import { CartStore } from './cart.store';

const makeItem = (
  productId: string,
  quantity = 1,
  product: Partial<CartProduct> = {},
): CartItem =>
  makeCartItem({
    id: `c-${productId}`,
    productId,
    quantity,
    product: makeCartProduct({ id: productId, ...product }),
  });

const makeMessageResponse = (
  overrides: Partial<CartMessageResponse> = {},
): CartMessageResponse => ({ status: true, code: 200, ...overrides });

const httpError = (status: number) => throwError(() => ({ status }));

describe('CartStore', () => {
  let api: {
    getCart: ReturnType<typeof vi.fn>;
    addToCart: ReturnType<typeof vi.fn>;
    updateItemQuantity: ReturnType<typeof vi.fn>;
    removeItemFromCart: ReturnType<typeof vi.fn>;
    clearCart: ReturnType<typeof vi.fn>;
  };
  let notify: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  const ids = (store: { items: () => CartItem[] }) =>
    store.items().map((i) => i.productId);

  const quantities = (store: { items: () => CartItem[] }) =>
    Object.fromEntries(store.items().map((i) => [i.productId, i.quantity]));

  const setup = () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ShopService, useValue: api },
        { provide: NotificationService, useValue: notify },
      ],
    });
    return TestBed.inject(CartStore);
  };

  const setupLoaded = () => {
    const store = setup();
    store.load();
    return store;
  };

  beforeEach(() => {
    api = {
      getCart: vi.fn(() => of(makeCartResponse([makeItem('p1'), makeItem('p2')]))),
      addToCart: vi.fn(() => of(makeCartItemResponse(makeItem('p3'), 201))),
      updateItemQuantity: vi.fn(() => of(makeCartItemResponse(makeItem('p1', 3)))),
      removeItemFromCart: vi.fn(() => of(makeMessageResponse())),
      clearCart: vi.fn(() => of(makeMessageResponse({ message: 'Cart cleared.' }))),
    };
    notify = { success: vi.fn(), error: vi.fn() };
  });

  describe('initial state', () => {
    it('starts idle and empty without calling the api', () => {
      const store = setup();

      expect(store.status()).toBe('idle');
      expect(store.items()).toEqual([]);
      expect(store.count()).toBe(0);
      expect(store.subtotal()).toBe(0);
      expect(api.getCart).not.toHaveBeenCalled();
    });
  });

  describe('load', () => {
    it('loads the items and sets success', () => {
      const store = setupLoaded();

      expect(ids(store)).toEqual(['p1', 'p2']);
      expect(store.count()).toBe(2);
      expect(store.status()).toBe('success');
    });

    it('stays loading until the request answers', () => {
      const pending = new Subject<CartResponse>();
      api.getCart.mockReturnValue(pending);
      const store = setup();

      store.load();
      expect(store.status()).toBe('loading');

      pending.next(makeCartResponse([makeItem('p1')]));
      expect(store.status()).toBe('success');
      expect(ids(store)).toEqual(['p1']);
    });

    it('falls back to an empty list when the payload has no items', () => {
      api.getCart.mockReturnValue(
        of({ status: true, code: 200 } as unknown as CartResponse),
      );
      const store = setupLoaded();

      expect(store.items()).toEqual([]);
      expect(store.status()).toBe('success');
    });

    it('sets error when the request fails', () => {
      api.getCart.mockReturnValue(httpError(500));
      const store = setupLoaded();

      expect(store.status()).toBe('error');
      expect(store.items()).toEqual([]);
    });

    it('recovers after an error when retried', () => {
      api.getCart.mockReturnValueOnce(httpError(500));
      const store = setupLoaded();
      expect(store.status()).toBe('error');

      store.load();

      expect(store.status()).toBe('success');
      expect(ids(store)).toEqual(['p1', 'p2']);
    });

    it('ignores the stale response when load is called twice', () => {
      const first = new Subject<CartResponse>();
      const second = new Subject<CartResponse>();
      api.getCart.mockReturnValueOnce(first).mockReturnValueOnce(second);
      const store = setup();

      store.load();
      store.load();
      second.next(makeCartResponse([makeItem('new')]));
      first.next(makeCartResponse([makeItem('stale')]));

      expect(ids(store)).toEqual(['new']);
    });
  });

  describe('computed totals', () => {
    it('sums the quantities of all items', () => {
      api.getCart.mockReturnValue(
        of(makeCartResponse([makeItem('p1', 2), makeItem('p2', 3)])),
      );
      const store = setupLoaded();

      expect(store.count()).toBe(2);
      expect(store.totalQuantity()).toBe(5);
    });

    it('prices every unit after its discount', () => {
      api.getCart.mockReturnValue(
        of(
          makeCartResponse([
            makeItem('p1', 2, { price: '200', discountType: 'PERCENT', discountValue: '25' }),
            makeItem('p2', 1, { price: '100' }),
          ]),
        ),
      );
      const store = setupLoaded();

      // 2 x (200 - 25%) + 1 x 100
      expect(store.subtotal()).toBe(400);
    });

    it('updates the subtotal when a quantity changes', () => {
      api.getCart.mockReturnValue(
        of(makeCartResponse([makeItem('p1', 1, { price: '100' })])),
      );
      const store = setupLoaded();

      store.updateQuantity('c-p1', 4);

      expect(store.subtotal()).toBe(400);
    });
  });

  describe('add', () => {
    it('sends the product id with a default quantity of 1', () => {
      const store = setup();

      store.add('p3');

      expect(api.addToCart).toHaveBeenCalledWith({ productId: 'p3', quantity: 1 });
    });

    it('sends the requested quantity', () => {
      const store = setup();

      store.add('p3', 2);

      expect(api.addToCart).toHaveBeenCalledWith({ productId: 'p3', quantity: 2 });
    });

    it('reloads the cart after success', () => {
      api.getCart.mockReturnValue(
        of(makeCartResponse([makeItem('p1'), makeItem('p3')])),
      );
      const store = setup();

      store.add('p3');

      expect(api.getCart).toHaveBeenCalledTimes(1);
      expect(ids(store)).toEqual(['p1', 'p3']);
    });

    it('shows its own toast when the response has no message', () => {
      const store = setup();

      store.add('p3');

      expect(notify.success).toHaveBeenCalledWith('SHOP.CART.ADDED');
    });

    it('does not show its own toast when the server sends a message', () => {
      api.addToCart.mockReturnValue(
        of({ ...makeCartItemResponse(makeItem('p3'), 201), message: 'Added' }),
      );
      const store = setup();

      store.add('p3');

      expect(notify.success).not.toHaveBeenCalled();
    });

    it('notifies the user and does not reload when the request fails', () => {
      api.addToCart.mockReturnValue(httpError(500));
      const store = setup();

      store.add('p3');

      expect(notify.error).toHaveBeenCalledWith('SHOP.CART.ADD_ERROR');
      expect(notify.success).not.toHaveBeenCalled();
      expect(api.getCart).not.toHaveBeenCalled();
    });
  });

  describe('updateQuantity', () => {
    it('changes the quantity immediately and calls the api with the cart item id', () => {
      api.updateItemQuantity.mockReturnValue(new Subject<CartItemResponse>());
      const store = setupLoaded();

      store.updateQuantity('c-p1', 3);

      expect(api.updateItemQuantity).toHaveBeenCalledWith('c-p1', { quantity: 3 });
      expect(quantities(store)).toEqual({ p1: 3, p2: 1 });
    });

    it('ignores a quantity below 1', () => {
      const store = setupLoaded();

      store.updateQuantity('c-p1', 0);

      expect(api.updateItemQuantity).not.toHaveBeenCalled();
      expect(quantities(store)).toEqual({ p1: 1, p2: 1 });
    });

    it('does nothing when the item is not in the cart', () => {
      const store = setupLoaded();

      store.updateQuantity('c-p9', 2);

      expect(api.updateItemQuantity).not.toHaveBeenCalled();
    });

    it('restores the previous quantity and notifies when the request fails', () => {
      api.updateItemQuantity.mockReturnValue(httpError(500));
      const store = setupLoaded();

      store.updateQuantity('c-p1', 5);

      expect(quantities(store)).toEqual({ p1: 1, p2: 1 });
      expect(notify.error).toHaveBeenCalledWith('SHOP.CART.UPDATE_ERROR');
    });

    it('rolls back only the failed item when two updates overlap', () => {
      const first = new Subject<CartItemResponse>();
      const second = new Subject<CartItemResponse>();
      api.updateItemQuantity
        .mockReturnValueOnce(first)
        .mockReturnValueOnce(second);
      const store = setupLoaded();

      store.updateQuantity('c-p1', 3);
      store.updateQuantity('c-p2', 4);
      first.error({ status: 500 });

      expect(quantities(store)).toEqual({ p1: 1, p2: 4 });
    });
  });

  describe('remove', () => {
    it('removes the item immediately and calls the api with the cart item id', () => {
      api.removeItemFromCart.mockReturnValue(new Subject<CartMessageResponse>());
      const store = setupLoaded();

      store.remove('c-p1');

      expect(api.removeItemFromCart).toHaveBeenCalledWith('c-p1');
      expect(ids(store)).toEqual(['p2']);
    });

    it('does nothing when the item is not in the cart', () => {
      const store = setupLoaded();

      store.remove('c-p9');

      expect(api.removeItemFromCart).not.toHaveBeenCalled();
      expect(store.count()).toBe(2);
    });

    it('restores the item at its position and notifies when the request fails', () => {
      api.getCart.mockReturnValue(
        of(makeCartResponse([makeItem('p1'), makeItem('p2'), makeItem('p3')])),
      );
      api.removeItemFromCart.mockReturnValue(httpError(500));
      const store = setupLoaded();

      store.remove('c-p2');

      expect(ids(store)).toEqual(['p1', 'p2', 'p3']);
      expect(notify.error).toHaveBeenCalledWith('SHOP.CART.UPDATE_ERROR');
    });

    it('rolls back only the failed item when two removes overlap', () => {
      const first = new Subject<CartMessageResponse>();
      const second = new Subject<CartMessageResponse>();
      api.removeItemFromCart
        .mockReturnValueOnce(first)
        .mockReturnValueOnce(second);
      const store = setupLoaded();

      store.remove('c-p1');
      store.remove('c-p2');
      first.error({ status: 500 });

      expect(ids(store)).toEqual(['p1']);
    });
  });

  describe('clear', () => {
    it('empties the cart and calls the api', () => {
      const store = setupLoaded();

      store.clear();

      expect(api.clearCart).toHaveBeenCalledTimes(1);
      expect(store.items()).toEqual([]);
      expect(store.count()).toBe(0);
    });

    it('restores the cart and notifies when the request fails', () => {
      api.clearCart.mockReturnValue(httpError(500));
      const store = setupLoaded();

      store.clear();

      expect(ids(store)).toEqual(['p1', 'p2']);
      expect(notify.error).toHaveBeenCalledWith('SHOP.CART.UPDATE_ERROR');
    });

    it('stays empty while the request is pending', () => {
      api.clearCart.mockReturnValue(new Subject());
      const store = setupLoaded();

      store.clear();

      expect(store.count()).toBe(0);
    });
  });
});
