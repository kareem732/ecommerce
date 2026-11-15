import { TestBed } from '@angular/core/testing';
import { Router, Routes, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { CheckoutFlow } from '../layout/checkout-flow/checkout-flow';
import { Cart } from '../pages/cart/cart';
import { ShippingAddress } from '../pages/shipping-address/shipping-address';
import { CHECKOUT_FLOW_ROUTE } from './checkout.route';

describe('CHECKOUT_FLOW_ROUTE', () => {
  const children = CHECKOUT_FLOW_ROUTE.children ?? [];
  const child = (path: string) => children.find((route) => route.path === path);

  describe('config', () => {
    it('lives on the cart path', () => {
      expect(CHECKOUT_FLOW_ROUTE.path).toBe('cart');
    });

    it('lazy loads the CheckoutFlow layout', async () => {
      expect(await CHECKOUT_FLOW_ROUTE.loadComponent?.()).toBe(CheckoutFlow);
    });

    it('has the cart and the shipping address as its only steps', () => {
      expect(children.map((route) => route.path)).toEqual(['', 'shipping-address']);
    });

    it('lazy loads Cart on the empty child path and shows the checkout action', async () => {
      const cart = child('');

      expect(cart?.pathMatch).toBe('full');
      expect(cart?.data?.['showCheckout']).toBe(true);
      expect(await cart?.loadComponent?.()).toBe(Cart);
    });

    it('lazy loads ShippingAddress without the checkout action', async () => {
      const shipping = child('shipping-address');

      expect(shipping?.data?.['showCheckout']).toBeUndefined();
      expect(await shipping?.loadComponent?.()).toBe(ShippingAddress);
    });
  });

  describe('navigation', () => {
    const routes: Routes = [CHECKOUT_FLOW_ROUTE];
    let router: Router;

    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
      router = TestBed.inject(Router);
    });

    it('navigates to the cart', async () => {
      await router.navigateByUrl('/cart');

      expect(router.url).toBe('/cart');
    });

    it('navigates to the shipping address step', async () => {
      await router.navigateByUrl('/cart/shipping-address');

      expect(router.url).toBe('/cart/shipping-address');
    });

    it('rejects an unknown step', async () => {
      await expect(router.navigateByUrl('/cart/unknown')).rejects.toThrow();
    });
  });
});
