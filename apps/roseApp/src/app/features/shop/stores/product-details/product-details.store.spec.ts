import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeProduct } from '../../../../shared/utils/testing/product.fixtures';
import { ProductResponse } from '../../interfaces/home.model/home-model-response';
import { ShopService } from '../../services/shop.service';
import { ProductDetailsStore } from './product-details.store';

const respond = (product: ReturnType<typeof makeProduct> | null) =>
  of({ status: true, code: 200, payload: { product } } as unknown as ProductResponse);

const withProduct = (product: ReturnType<typeof makeProduct>) =>
  ({ status: true, code: 200, payload: { product } }) as ProductResponse;

describe('ProductDetailsStore', () => {
  let getProduct: ReturnType<typeof vi.fn>;
  let result: (id: string) => Observable<ProductResponse>;

  const setup = () => {
    TestBed.configureTestingModule({
      providers: [ProductDetailsStore, { provide: ShopService, useValue: { getProduct } }],
    });
    return TestBed.inject(ProductDetailsStore);
  };

  beforeEach(() => {
    result = (id) => respond(makeProduct({ id }));
    getProduct = vi.fn((id: string) => result(id));
  });

  describe('initial state', () => {
    it('starts loading with nothing selected', () => {
      const store = setup();

      expect(store.status()).toBe('loading');
      expect(store.product()).toBeNull();
      expect(store.productId()).toBeNull();
      expect(store.activeIndex()).toBe(0);
      expect(store.images()).toEqual([]);
      expect(getProduct).not.toHaveBeenCalled();
    });
  });

  describe('load', () => {
    it('loads the product and sets success', () => {
      const store = setup();

      store.load('p1');

      expect(getProduct).toHaveBeenCalledWith('p1');
      expect(store.productId()).toBe('p1');
      expect(store.product()?.id).toBe('p1');
      expect(store.status()).toBe('success');
    });

    it('stays loading until the request answers', () => {
      const pending = new Subject<ProductResponse>();
      result = () => pending;
      const store = setup();

      store.load('p1');
      expect(store.status()).toBe('loading');

      pending.next(withProduct(makeProduct({ id: 'p1' })));
      expect(store.status()).toBe('success');
    });

    it('sets missing-id and skips the request when the id is null', () => {
      const store = setup();

      store.load(null);

      expect(store.status()).toBe('missing-id');
      expect(store.product()).toBeNull();
      expect(getProduct).not.toHaveBeenCalled();
    });

    it('sets not-found when the payload has no product', () => {
      result = () => respond(null);
      const store = setup();

      store.load('p1');

      expect(store.status()).toBe('not-found');
      expect(store.product()).toBeNull();
    });

    it('sets not-found on a 404', () => {
      result = () => throwError(() => ({ status: 404 }));
      const store = setup();

      store.load('p1');

      expect(store.status()).toBe('not-found');
    });

    it('sets error on any other failure', () => {
      result = () => throwError(() => ({ status: 500 }));
      const store = setup();

      store.load('p1');

      expect(store.status()).toBe('error');
      expect(store.product()).toBeNull();
    });

    it('reloads and resets the gallery position when the id signal changes', () => {
      const id = signal<string | null>('p1');
      const store = setup();
      TestBed.runInInjectionContext(() => store.load(id));
      TestBed.tick();
      store.selectImage(0);
      store.setThumbPage(2);

      id.set('p2');
      TestBed.tick();

      expect(getProduct).toHaveBeenCalledTimes(2);
      expect(store.product()?.id).toBe('p2');
      expect(store.activeIndex()).toBe(0);
      expect(store.thumbPage()).toBe(0);
    });

    it('ignores a late response of the previous product', () => {
      const pending = new Map<string, Subject<ProductResponse>>();
      result = (id) => {
        const subject = new Subject<ProductResponse>();
        pending.set(id, subject);
        return subject;
      };
      const id = signal<string | null>('old');
      const store = setup();
      TestBed.runInInjectionContext(() => store.load(id));
      TestBed.tick();

      id.set('new');
      TestBed.tick();
      pending.get('old')?.next(withProduct(makeProduct({ id: 'old' })));
      pending.get('new')?.next(withProduct(makeProduct({ id: 'new' })));

      expect(store.product()?.id).toBe('new');
    });
  });

  describe('retry', () => {
    it('requests the same product again after an error', () => {
      result = () => throwError(() => ({ status: 500 }));
      const store = setup();
      store.load('p1');
      expect(store.status()).toBe('error');

      result = (id) => respond(makeProduct({ id }));
      store.retry();

      expect(getProduct).toHaveBeenCalledTimes(2);
      expect(getProduct).toHaveBeenLastCalledWith('p1');
      expect(store.status()).toBe('success');
    });

    it('does nothing when no product was requested', () => {
      const store = setup();

      store.retry();

      expect(getProduct).not.toHaveBeenCalled();
    });
  });

  describe('gallery', () => {
    const withGallery = () => {
      result = (id) =>
        respond(
          makeProduct({
            id,
            cover: 'cover.jpg',
            gallery: JSON.stringify(['1.jpg', '2.jpg']),
          }),
        );
      const store = setup();
      store.load('p1');
      return store;
    };

    it('builds the images and the gallery items', () => {
      const store = withGallery();

      expect(store.images()).toEqual(['cover.jpg', '1.jpg', '2.jpg']);
      expect(store.galleryItems()).toEqual([
        { url: 'cover.jpg', index: 0 },
        { url: '1.jpg', index: 1 },
        { url: '2.jpg', index: 2 },
      ]);
    });

    it('selects a valid image', () => {
      const store = withGallery();

      store.selectImage(2);

      expect(store.activeIndex()).toBe(2);
    });

    it('ignores an out of range index', () => {
      const store = withGallery();

      store.selectImage(3);
      store.selectImage(-1);

      expect(store.activeIndex()).toBe(0);
    });

    it('stores the thumbnails page', () => {
      const store = withGallery();

      store.setThumbPage(1);

      expect(store.thumbPage()).toBe(1);
    });

    it('shows at least 1 thumbnail and at most 7', () => {
      const store = setup();
      expect(store.thumbNumVisible()).toBe(1);

      result = (id) =>
        respond(
          makeProduct({
            id,
            cover: 'c.jpg',
            gallery: JSON.stringify(Array.from({ length: 10 }, (_, i) => `${i}.jpg`)),
          }),
        );
      store.load('p1');

      expect(store.thumbNumVisible()).toBe(7);
    });
  });
});