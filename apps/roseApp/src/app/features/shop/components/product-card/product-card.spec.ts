import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProductCard } from './product-card';
import { Product } from '../../interfaces/home.model/home-model-response';
import { daysAgo, makeProduct } from '../../../../shared/utils/testing/product.fixtures';
import {
  provideTranslateTesting,
  useEnglish,
} from '../../../../shared/utils/testing/translate.testing';

describe('ProductCard', () => {
  let fixture: ComponentFixture<ProductCard>;
  let element: HTMLElement;

  const render = (overrides: Partial<Product> = {}): Product => {
    const product = makeProduct(overrides);
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();
    return product;
  };

  const text = (selector: string) => element.querySelector(selector)?.textContent?.trim();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCard],
      providers: [provideTranslateTesting(), provideRouter([])],
    }).compileComponents();
    useEnglish();

    fixture = TestBed.createComponent(ProductCard);
    element = fixture.nativeElement;
  });

  describe('content', () => {
    it('renders the title and the cover image', () => {
      render({ title: 'Fuchsia Brilliance Vase', cover: 'vase.webp' });

      const img = element.querySelector('img') as HTMLImageElement;
      expect(text('.product__title')).toBe('Fuchsia Brilliance Vase');
      expect(img.getAttribute('src')).toBe('vase.webp');
      expect(img.getAttribute('alt')).toBe('Fuchsia Brilliance Vase');
    });

        it('renders the discounted price with the old price', () => {
      render({ price: '1000', discountType: 'PERCENT', discountValue: 41 });

      expect(text('.product__current')).toBe('590.00 EGP');
      expect(text('.product__old')).toBe('1,000.00 EGP');
    });

    it('hides the old price when there is no discount', () => {
      render({ price: '1000', discountValue: null });

      expect(text('.product__current')).toBe('1,000.00 EGP');
      expect(element.querySelector('.product__old')).toBeNull();
    });

    it('fills as many stars as the rating', () => {
      render({ rating: 3 });

      expect(element.querySelectorAll('lucide-angular.star')).toHaveLength(5);
      expect(element.querySelectorAll('lucide-angular.star--filled')).toHaveLength(3);
    });

    it('labels the rating and the buttons for screen readers', () => {
      render({ rating: 3 });

      const label = (selector: string) =>
        element.querySelector(selector)?.getAttribute('aria-label');
      expect(label('.product__stars')).toBe('Rating 3 out of 5');
      expect(label('.product__cart')).toBe('Add to cart');
      expect(label('button.icon-btn')).toBe('Add to wishlist');
      expect(label('a.icon-btn')).toBe('Quick view');
    });
  });

  describe('badges', () => {
    it('shows NEW for a recently added product', () => {
      render({ createdAt: daysAgo(3) });

      expect(text('.badge--new')).toBe('NEW');
    });

    it('hides NEW for an old product', () => {
      render({ createdAt: daysAgo(90) });

      expect(element.querySelector('.badge--new')).toBeNull();
    });

    it('shows HOT when the rating is 4 or more', () => {
      render({ rating: 4 });

      expect(text('.badge--hot')).toBe('HOT');
    });

    it('hides HOT when the rating is below 4', () => {
      render({ rating: 3 });

      expect(element.querySelector('.badge--hot')).toBeNull();
    });

    it('shows OUT OF STOCK and disables the cart button when stock is zero', () => {
      render({ stock: 0 });

      const cart = element.querySelector('.product__cart') as HTMLButtonElement;
      expect(text('.badge--out')).toBe('OUT OF STOCK');
      expect(cart.disabled).toBe(true);
    });

    it('hides OUT OF STOCK when the product is available', () => {
      render({ stock: 5 });

      expect(element.querySelector('.badge--out')).toBeNull();
      expect((element.querySelector('.product__cart') as HTMLButtonElement).disabled).toBe(false);
    });
  });

  describe('outputs', () => {
    it('emits addToCart with the product', () => {
      const product = render();
      let emitted: Product | undefined;
      fixture.componentInstance.addToCart.subscribe((p) => (emitted = p));

      (element.querySelector('.product__cart') as HTMLButtonElement).click();

      expect(emitted).toBe(product);
    });

    it('does not emit addToCart when out of stock', () => {
      render({ stock: 0 });
      let emitted: Product | undefined;
      fixture.componentInstance.addToCart.subscribe((p) => (emitted = p));

      (element.querySelector('.product__cart') as HTMLButtonElement).click();

      expect(emitted).toBeUndefined();
    });

    it('emits addToWishlist from the heart button', () => {
      const product = render();
      let emitted: Product | undefined;
      fixture.componentInstance.addToWishlist.subscribe((p) => (emitted = p));

      (element.querySelector('button.icon-btn') as HTMLButtonElement).click();

      expect(emitted).toBe(product);
    });
  });

    describe('navigation', () => {
    it('links the eye button to the product details page', () => {
      const product = render({ id: 'prod-42' });

      const link = element.querySelector('a.icon-btn') as HTMLAnchorElement;
      expect(link.getAttribute('href')).toBe(`/shop/products/${product.id}`);
    });
  });
});
