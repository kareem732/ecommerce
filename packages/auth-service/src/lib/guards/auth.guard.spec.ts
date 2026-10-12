import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { SessionService } from '../services/session.service';
import { authGuard } from './auth.guard';
import { provideAuthConfigForTests } from '../testing/auth-testing';

describe('authGuard', () => {
  const loggedIn = signal(false);
  const run = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/cart' } as RouterStateSnapshot),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideAuthConfigForTests(),
        { provide: SessionService, useValue: { isLoggedIn: loggedIn } },
      ],
    });
  });

  it('allows logged-in users', () => {
    loggedIn.set(true);
    expect(run()).toBe(true);
  });

  it('redirects guests to login with a returnUrl', () => {
    loggedIn.set(false);
    const result = run();

    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/auth/login?returnUrl=%2Fcart');
  });
});
