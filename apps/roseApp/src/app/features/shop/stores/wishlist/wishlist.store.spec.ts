import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@org/auth-service';
import { Observable, of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeProduct } from '../../../../shared/utils/testing/product.fixtures';
import { WishlistItem,WishlistMessageResponse,WishlistResponse} from '../../interfaces/wishlist.model/wishlist-response';
import { ShopService } from '../../services/shop.service';
import { WishlistStore } from './wishlist.store';

const makeItem = (productId: string): WishlistItem => ({
  id: `w-${productId}`,
  userId: 'u1',
  productId,
  createdAt: '2026-11-02T05:53:27.423Z',
  product: makeProduct({ id: productId }),
});

const makeListResponse = (...ids: string[]): WishlistResponse =>
  ({
    status: true,
    code: 200,
    payload: { wishlistItems: ids.map(makeItem) },
  }) as WishlistResponse;

const makeMessageResponse = (
  overrides: Partial<WishlistMessageResponse> = {},
): WishlistMessageResponse =>
  ({ status: true, code: 200, ...overrides }) as WishlistMessageResponse;

const httpError = (status: number) => throwError(() => ({ status }));

describe('WishlistStore', () => {
  let api: {
    getWishlist: ReturnType<typeof vi.fn>;
    addToWishlist: ReturnType<typeof vi.fn>;
    removeFromWishlist: ReturnType<typeof vi.fn>;
    clearWishlist: ReturnType<typeof vi.fn>;
  };
  let notify: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  const ids = (store: { items: () => WishlistItem[] }) =>
    store.items().map((i) => i.productId);

  const setup = () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ShopService, useValue: api },
        { provide: NotificationService, useValue: notify },
        { provide: TranslateService, useValue: { instant: (k: string) => k } },
      ],
    });
    return TestBed.inject(WishlistStore);
  };

  const setupLoaded = () => {
    const store = setup();
    store.load();
    return store;
  };

  beforeEach(() => {
    api = {
      getWishlist: vi.fn(() => of(makeListResponse('p1', 'p2'))),
      addToWishlist: vi.fn(() => of(makeMessageResponse())),
      removeFromWishlist: vi.fn(() => of(makeMessageResponse())),
      clearWishlist: vi.fn(() => of(makeMessageResponse())),
    };
    notify = { success: vi.fn(), error: vi.fn() };
  });

  describe('initial state', () => {
    it('starts idle and empty without calling the api', () => {
      const store = setup();

      expect(store.status()).toBe('idle');
      expect(store.items()).toEqual([]);
      expect(store.count()).toBe(0);
      expect(api.getWishlist).not.toHaveBeenCalled();
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
      const pending = new Subject<WishlistResponse>();
      api.getWishlist.mockReturnValue(pending);
      const store = setup();

      store.load();
      expect(store.status()).toBe('loading');

      pending.next(makeListResponse('p1'));
      expect(store.status()).toBe('success');
      expect(ids(store)).toEqual(['p1']);
    });

    it('falls back to an empty list when the payload has no items', () => {
      api.getWishlist.mockReturnValue(
        of({ status: true, code: 200 } as unknown as WishlistResponse),
      );
      const store = setupLoaded();

      expect(store.items()).toEqual([]);
      expect(store.status()).toBe('success');
    });

    it('sets error when the request fails', () => {
      api.getWishlist.mockReturnValue(httpError(500));
      const store = setupLoaded();

      expect(store.status()).toBe('error');
      expect(store.items()).toEqual([]);
    });

    it('recovers after an error when retried', () => {
      api.getWishlist.mockReturnValueOnce(httpError(500));
      const store = setupLoaded();
      expect(store.status()).toBe('error');

      store.load();

      expect(store.status()).toBe('success');
      expect(ids(store)).toEqual(['p1', 'p2']);
    });

    it('ignores the stale response when load is called twice', () => {
      const first = new Subject<WishlistResponse>();
      const second = new Subject<WishlistResponse>();
      api.getWishlist.mockReturnValueOnce(first).mockReturnValueOnce(second);
      const store = setup();

      store.load();
      store.load();
      second.next(makeListResponse('new'));
      first.next(makeListResponse('stale'));

      expect(ids(store)).toEqual(['new']);
    });
  });

  describe('has', () => {
    it('tells whether a product is saved', () => {
      const store = setupLoaded();

      expect(store.has('p1')).toBe(true);
      expect(store.has('p3')).toBe(false);
    });
  });

  describe('add', () => {
    it('sends the product id to the api', () => {
      const store = setup();

      store.add('p3');

      expect(api.addToWishlist).toHaveBeenCalledWith({ productId: 'p3' });
    });

    it('makes the product part of the wishlist after success', () => {
      api.getWishlist.mockReturnValue(of(makeListResponse('p1', 'p2', 'p3')));
      const store = setupLoaded();

      store.add('p3');

      expect(store.has('p3')).toBe(true);
    });

    it('shows its own toast when the response has no message', () => {
      const store = setup();

      store.add('p3');

      expect(notify.success).toHaveBeenCalledWith('WISHLIST.ADDED');
    });

    it('does not show its own toast when the server sends a message', () => {
      api.addToWishlist.mockReturnValue(
        of(makeMessageResponse({ code: 201, message: 'Added' })),
      );
      const store = setup();

      store.add('p3');

      expect(notify.success).not.toHaveBeenCalled();
    });

    it('syncs with the server on a 409 conflict', () => {
      api.addToWishlist.mockReturnValue(httpError(409));
      const store = setup();

      store.add('p1');

      expect(store.has('p1')).toBe(true);
    });

    it('does not show a success toast when the request fails', () => {
      api.addToWishlist.mockReturnValue(httpError(500));
      const store = setup();

      store.add('p1');

      expect(notify.success).not.toHaveBeenCalled();
    });

    it('notifies the user when the request fails', () => {
      api.addToWishlist.mockReturnValue(httpError(500));
      const store = setup();

      store.add('p1');

      expect(notify.error).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('removes the item immediately and calls the api with the wishlist item id', () => {
      const pending = new Subject<WishlistMessageResponse>();
      api.removeFromWishlist.mockReturnValue(pending);
      const store = setupLoaded();

      store.remove('p1');

      expect(api.removeFromWishlist).toHaveBeenCalledWith('w-p1');
      expect(ids(store)).toEqual(['p2']);
    });

    it('does nothing when the product is not in the list', () => {
      const store = setupLoaded();

      store.remove('p9');

      expect(api.removeFromWishlist).not.toHaveBeenCalled();
      expect(store.count()).toBe(2);
    });

    it('restores the item when the request fails', () => {
      api.removeFromWishlist.mockReturnValue(httpError(500));
      const store = setupLoaded();

      store.remove('p1');

      expect(ids(store).sort()).toEqual(['p1', 'p2']);
    });

    it('rolls back only the failed item when two removes overlap', () => {
      const first = new Subject<WishlistMessageResponse>();
      const second = new Subject<WishlistMessageResponse>();
      api.removeFromWishlist
        .mockReturnValueOnce(first)
        .mockReturnValueOnce(second);
      const store = setupLoaded();

      store.remove('p1');
      store.remove('p2');
      first.error({ status: 500 });

      expect(ids(store)).toEqual(['p1']);
    });

    it('notifies the user when the request fails', () => {
      api.removeFromWishlist.mockReturnValue(httpError(500));
      const store = setupLoaded();

      store.remove('p1');

      expect(notify.error).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('empties the list and calls the api', () => {
      const store = setupLoaded();

      store.clear();

      expect(api.clearWishlist).toHaveBeenCalledTimes(1);
      expect(store.items()).toEqual([]);
      expect(store.count()).toBe(0);
    });

    it('restores the list when the request fails', () => {
      api.clearWishlist.mockReturnValue(httpError(500));
      const store = setupLoaded();

      store.clear();

      expect(ids(store).sort()).toEqual(['p1', 'p2']);
    });

    it('stays empty while the request is pending', () => {
      api.clearWishlist.mockReturnValue(new Subject());
      const store = setupLoaded();

      store.clear();

      expect(store.count()).toBe(0);
    });
  });

  describe('toggle', () => {
    it('adds a product that is not in the list', () => {
      const store = setupLoaded();

      store.toggle('p3');

      expect(api.addToWishlist).toHaveBeenCalledWith({ productId: 'p3' });
      expect(api.removeFromWishlist).not.toHaveBeenCalled();
    });

    it('removes a product that is already in the list', () => {
      const store = setupLoaded();

      store.toggle('p1');

      expect(api.removeFromWishlist).toHaveBeenCalledWith('w-p1');
      expect(api.addToWishlist).not.toHaveBeenCalled();
      expect(store.has('p1')).toBe(false);
    });
  });
});
