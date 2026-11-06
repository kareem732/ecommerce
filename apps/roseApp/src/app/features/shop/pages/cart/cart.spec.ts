import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  makeCartItem,
  makeCartProduct,
} from '../../../../shared/utils/testing/cart.fixtures';
import {
  provideTranslateTesting,
  useEnglish,
} from '../../../../shared/utils/testing/translate.testing';
import { CartItem } from '../../interfaces/cart.model/cart.model';
import { Product } from '../../interfaces/home.model/home-model-response';
import { CartStore } from '../../stores/cart/cart.store';
import { HomeStore } from '../../stores/home/home.store';
import { WishlistStore } from '../../stores/wishlist/wishlist.store';
import { Cart } from './cart';

describe('Cart', () => {
  let fixture: ComponentFixture<Cart>;
  let element: HTMLElement;
  let items: ReturnType<typeof signal<CartItem[]>>;
  let cartStore: {
    items: typeof items;
    count: ReturnType<typeof signal<number>>;
    subtotal: ReturnType<typeof signal<number>>;
    load: ReturnType<typeof vi.fn>;
    add: ReturnType<typeof vi.fn>;
    updateQuantity: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };
  let wishlistStore: {
    ids: ReturnType<typeof signal<Set<string>>>;
    toggle: ReturnType<typeof vi.fn>;
  };

  const setup = async (initial: CartItem[] = []) => {
    items = signal<CartItem[]>(initial);
    cartStore = {
      items,
      count: signal(initial.length),
      subtotal: signal(0),
      load: vi.fn(),
      add: vi.fn(),
      updateQuantity: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    };
    wishlistStore = { ids: signal(new Set<string>()), toggle: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Cart],
      providers: [
        { provide: CartStore, useValue: cartStore },
        { provide: WishlistStore, useValue: wishlistStore },
        { provide: HomeStore, useValue: { bestSelling: signal<Product[]>([]) } },
        provideTranslateTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
    useEnglish();

    fixture = TestBed.createComponent(Cart);
    fixture.detectChanges();
    element = fixture.nativeElement;
  };

  it('loads the cart on init', async () => {
    await setup();

    expect(cartStore.load).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state when there are no items', async () => {
    await setup([]);

    expect(element.textContent).toMatch(/Your cart is empty|CART\.EMPTY/);
  });

  it('renders a row for every cart item', async () => {
    await setup([
      makeCartItem({
        id: 'c-p1',
        productId: 'p1',
        quantity: 2,
        product: makeCartProduct({ id: 'p1', title: 'First Bouquet' }),
      }),
      makeCartItem({
        id: 'c-p2',
        productId: 'p2',
        quantity: 1,
        product: makeCartProduct({ id: 'p2', title: 'Second Bouquet' }),
      }),
    ]);

    const titles = Array.from(element.querySelectorAll('h3')).map((el) =>
      el.textContent?.trim(),
    );
    expect(titles).toEqual(['First Bouquet', 'Second Bouquet']);
  });

  it('adds a recommended product through the store', async () => {
    await setup();

    fixture.componentInstance['onAddToCart']({ id: 'p9' } as Product);

    expect(cartStore.add).toHaveBeenCalledWith('p9');
  });

  it('toggles the wishlist through the store', async () => {
    await setup();

    fixture.componentInstance['onAddToWishlist']({ id: 'p9' } as Product);

    expect(wishlistStore.toggle).toHaveBeenCalledWith('p9');
  });
});
