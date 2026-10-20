import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Home } from '../pages/home/home';
import { Shop } from '../shop';
import { SHOP_ROUTES } from './shop.routes';

describe('SHOP_ROUTES', () => {
  const layout = SHOP_ROUTES[0];
  const children = layout.children ?? [];

  describe('config', () => {
    it('has a single layout route on the empty path', () => {
      expect(SHOP_ROUTES).toHaveLength(1);
      expect(layout.path).toBe('');
    });

    it('lazy loads the Shop layout', async () => {
      expect(await layout.loadComponent?.()).toBe(Shop);
    });

    it('redirects the empty child path to home', () => {
      const redirect = children.find((route) => route.path === '');

      expect(redirect?.redirectTo).toBe('home');
      expect(redirect?.pathMatch).toBe('full');
    });

    it('lazy loads Home on the home path', async () => {
      const home = children.find((route) => route.path === 'home');

      expect(await home?.loadComponent?.()).toBe(Home);
    });
  });

  describe('navigation', () => {
    let router: Router;

    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [provideRouter(SHOP_ROUTES)] });
      router = TestBed.inject(Router);
    });

    it('redirects the root to /home', async () => {
      await router.navigateByUrl('/');

      expect(router.url).toBe('/home');
    });

    it('navigates to /home directly', async () => {
      await router.navigateByUrl('/home');

      expect(router.url).toBe('/home');
    });

    it('rejects an unknown path', async () => {
      await expect(router.navigateByUrl('/unknown')).rejects.toThrow();
    });
  });
});
