import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { SessionService } from '../services/session.service';
import { guestGuard } from './guest.guard';
import { provideAuthConfigForTests } from '../testing/auth-testing';

describe('guestGuard', () => {
  const loggedIn = signal(false);
  const run = () =>
    TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, { url: '/auth/login' } as RouterStateSnapshot),
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

  it('allows guests', () => {
    loggedIn.set(false);
    expect(run()).toBe(true);
  });

  it('redirects logged-in users to home', () => {
    loggedIn.set(true);
    const result = run();

    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/');
  });
});
