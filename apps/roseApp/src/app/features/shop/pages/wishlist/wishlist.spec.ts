import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, computed } from '@angular/core';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfirmationDialogService } from '../../../../shared/business/confirmation-dialog.service';
import { makeProduct } from '../../../../shared/utils/testing/product.fixtures';
import { provideTranslateTesting,useEnglish} from '../../../../shared/utils/testing/translate.testing';
import { WishlistItem} from '../../interfaces/wishlist.model/wishlist-response';
import { WishlistStatus} from '../../stores/wishlist/wishlist.state';
import { WishlistStore } from '../../stores/wishlist/wishlist.store';
import { Wishlist } from './wishlist';

const makeItem = (
  productId: string,
  product: Parameters<typeof makeProduct>[0] = {},
): WishlistItem => ({
  id: `w-${productId}`,
  userId: 'u1',
  productId,
  createdAt: '2026-11-02T05:53:27.423Z',
  product: makeProduct({ id: productId, title: `Product ${productId}`, ...product }),
});

describe('Wishlist', () => {
  let fixture: ComponentFixture<Wishlist>;
  let element: HTMLElement;
  let confirm: ReturnType<typeof vi.fn>;

  const items = signal<WishlistItem[]>([]);
  const status = signal<WishlistStatus>('idle');
  const store = {
    items,
    status,
    count: computed(() => items().length),
    load: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  };

  const render = (list: WishlistItem[] = [], state: WishlistStatus = 'success') => {
    items.set(list);
    status.set(state);
    fixture.detectChanges();
  };

  const $ = <T extends Element = HTMLElement>(selector: string) =>
    element.querySelector<T>(selector);
  const $$ = (selector: string) => element.querySelectorAll(selector);

  beforeEach(async () => {
    vi.clearAllMocks();
    confirm = vi.fn().mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [Wishlist],
      providers: [
        provideTranslateTesting(),
        provideRouter([]),
        { provide: WishlistStore, useValue: store },
        { provide: ConfirmationDialogService, useValue: { confirm } },
      ],
    }).compileComponents();
    useEnglish();

    fixture = TestBed.createComponent(Wishlist);
    element = fixture.nativeElement;
  });

  it('loads the wishlist when created', () => {
    expect(store.load).toHaveBeenCalledTimes(1);
  });

  describe('states', () => {
    it('shows the loading state while loading an empty list', () => {
      render([], 'loading');

      expect($('.wishlist__state')).not.toBeNull();
      expect($$('.item')).toHaveLength(0);
    });

    it('keeps showing the items while reloading', () => {
      render([makeItem('p1')], 'loading');

      expect($$('.item')).toHaveLength(1);
    });

    it('shows the error state with a working retry button', () => {
      render([], 'error');

      $<HTMLButtonElement>('.wishlist__state button')!.click();

      expect(store.load).toHaveBeenCalledTimes(2);
    });

    it('shows the empty state and hides the clear button', () => {
      render([], 'success');

      expect($('.wishlist__state')).not.toBeNull();
      expect($('.wishlist__clear')).toBeNull();
      expect($$('.item')).toHaveLength(0);
    });

    it('renders one row per item', () => {
      render([makeItem('p1'), makeItem('p2'), makeItem('p3')]);

      expect($$('.item')).toHaveLength(3);
      expect($('.wishlist__clear')).not.toBeNull();
    });
  });

  describe('item row', () => {
    it('renders title, image and link to the product', () => {
      render([makeItem('p1', { cover: 'a.webp' })]);

      const img = $<HTMLImageElement>('.item__image')!;
      expect($('.item__title')?.textContent?.trim()).toBe('Product p1');
      expect(img.getAttribute('src')).toBe('a.webp');
      expect($<HTMLAnchorElement>('.item__image-link')!.getAttribute('href')).toBe(
        '/shop/products/p1',
      );
    });

    it('shows the old price only when discounted', () => {
      render([
        makeItem('p1', { price: '1000', discountType: 'PERCENT', discountValue: 50 }),
        makeItem('p2', { price: '1000', discountValue: null }),
      ]);

      const rows = $$('.item');
      expect(rows[0].querySelector('.item__price-old')).not.toBeNull();
      expect(rows[1].querySelector('.item__price-old')).toBeNull();
    });
  });

  describe('stock', () => {
    it('offers add to cart for an available product', () => {
      render([makeItem('p1', { stock: 5 })]);

      expect($('.item--out')).toBeNull();
      expect($('.item__status--in')).not.toBeNull();
      expect($('.btn--dark')).not.toBeNull();
      expect($('.btn--soft')).toBeNull();
    });

    it('marks an out-of-stock product and offers similar products instead', () => {
      render([makeItem('p1', { stock: 0 })]);

      expect($('.item--out')).not.toBeNull();
      expect($('.item__status--out')).not.toBeNull();
      expect($('.item__actions .btn--dark')).toBeNull();
      expect($<HTMLAnchorElement>('.btn--soft')!.getAttribute('href')).toBe(
        '/shop/products',
      );
    });
  });

  describe('actions', () => {
    it('removes the product from the wishlist', () => {
      render([makeItem('p1'), makeItem('p2')]);

      $$('.item__delete')[1].dispatchEvent(new Event('click'));

      expect(store.remove).toHaveBeenCalledExactlyOnceWith('p2');
    });

    it('labels the delete button for screen readers', () => {
      render([makeItem('p1')]);

      expect($('.item__delete')!.getAttribute('aria-label')).toBeTruthy();
    });

    it('clears the wishlist after confirmation', async () => {
      render([makeItem('p1')]);

      $<HTMLButtonElement>('.wishlist__clear')!.click();
      await fixture.whenStable();

      expect(confirm).toHaveBeenCalledTimes(1);
      expect(store.clear).toHaveBeenCalledTimes(1);
    });

    it('does not clear the wishlist when the confirmation is cancelled', async () => {
      confirm.mockResolvedValue(false);
      render([makeItem('p1')]);

      $<HTMLButtonElement>('.wishlist__clear')!.click();
      await fixture.whenStable();

      expect(confirm).toHaveBeenCalledTimes(1);
      expect(store.clear).not.toHaveBeenCalled();
    });
  });
});
