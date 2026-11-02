import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  daysAgo,
  makeProduct,
} from '../../../../shared/utils/testing/product.fixtures';
import {
  provideTranslateTesting,
  useEnglish,
} from '../../../../shared/utils/testing/translate.testing';
import { Product } from '../../interfaces/home.model/home-model-response';
import { ProductCard } from './product-card';

describe('ProductCard', () => {
  let fixture: ComponentFixture<ProductCard>;
  let element: HTMLElement;

  const render = (overrides: Partial<Product> = {}): Product => {
    const product = makeProduct(overrides);
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();
    return product;
  };

  const text = (selector: string) =>
    element.querySelector(selector)?.textContent?.trim();
  const attr = (selector: string, name: string) =>
    element.querySelector(selector)?.getAttribute(name);
  const click = (selector: string) =>
    (element.querySelector(selector) as HTMLElement).click();

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

      expect(text('.product__title')).toBe('Fuchsia Brilliance Vase');
      expect(attr('img', 'src')).toBe('vase.webp');
      expect(attr('img', 'alt')).toBe('Fuchsia Brilliance Vase');
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
      expect(
        element.querySelectorAll('lucide-angular.star--filled'),
      ).toHaveLength(3);
    });

    it('labels the rating and the buttons for screen readers', () => {
      render({ rating: 3 });

      expect(attr('.product__stars', 'aria-label')).toBe('Rating 3 out of 5');
      expect(attr('.product__cart', 'aria-label')).toBe('Add to cart');
      expect(attr('button.icon-btn', 'aria-label')).toBe('Add to wishlist');
      expect(attr('a.icon-btn', 'aria-label')).toBe('Quick view');
    });
  });

  describe('wishlist state', () => {
    it('is not pressed by default', () => {
      render();

      expect(attr('button.icon-btn', 'aria-pressed')).toBe('false');
      expect(
        element.querySelector('button.icon-btn')!.classList,
      ).not.toContain('icon-btn--active');
    });

    it('is pressed and highlighted when wishlisted', () => {
      fixture.componentRef.setInput('wishlisted', true);
      render();

      expect(attr('button.icon-btn', 'aria-pressed')).toBe('true');
      expect(element.querySelector('button.icon-btn')!.classList).toContain(
        'icon-btn--active',
      );
    });

    it('updates when the input changes', () => {
      render();

      fixture.componentRef.setInput('wishlisted', true);
      fixture.detectChanges();

      expect(attr('button.icon-btn', 'aria-pressed')).toBe('true');
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

      const cart = element.querySelector('.product__cart') as HTMLButtonElement;
      expect(element.querySelector('.badge--out')).toBeNull();
      expect(cart.disabled).toBe(false);
    });
  });

  describe('outputs', () => {
    it('emits addToCart with the product', () => {
      const product = render();
      const spy = vi.fn();
      fixture.componentInstance.addToCart.subscribe(spy);

      click('.product__cart');

      expect(spy).toHaveBeenCalledExactlyOnceWith(product);
    });

    it('does not emit addToCart when out of stock', () => {
      render({ stock: 0 });
      const spy = vi.fn();
      fixture.componentInstance.addToCart.subscribe(spy);

      click('.product__cart');

      expect(spy).not.toHaveBeenCalled();
    });

    it('emits addToWishlist from the heart button', () => {
      const product = render();
      const spy = vi.fn();
      fixture.componentInstance.addToWishlist.subscribe(spy);

      click('button.icon-btn');

      expect(spy).toHaveBeenCalledExactlyOnceWith(product);
    });

    it('does not let button clicks bubble to the parent', () => {
      render();
      const parentClick = vi.fn();
      element.addEventListener('click', parentClick);

      click('.product__cart');
      click('button.icon-btn');

      expect(parentClick).not.toHaveBeenCalled();
    });
  });

  describe('navigation', () => {
    it('links the eye button to the product details page', () => {
      const product = render({ id: 'prod-42' });

      expect(attr('a.icon-btn', 'href')).toBe(`/shop/products/${product.id}`);
    });
  });
});
