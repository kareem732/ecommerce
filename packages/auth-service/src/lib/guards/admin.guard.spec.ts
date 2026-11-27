import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { SessionService } from '../services/session.service';
import { adminGuard } from './admin.guard';
import { provideAuthConfigForTests } from '../testing/auth-testing';

describe('adminGuard', () => {
  const loggedIn = signal(false);
  const isAdmin = signal(false);

  const run = () =>
    TestBed.runInInjectionContext(() =>
      adminGuard({} as ActivatedRouteSnapshot, { url: '/adminDashboard' } as RouterStateSnapshot),
    );
  const serialize = (result: unknown) => TestBed.inject(Router).serializeUrl(result as UrlTree);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideAuthConfigForTests(),
        { provide: SessionService, useValue: { isLoggedIn: loggedIn, isAdmin } },
      ],
    });
  });

  it('allows logged-in admins', () => {
    loggedIn.set(true);
    isAdmin.set(true);
    expect(run()).toBe(true);
  });

  it('redirects logged-in non-admins to the unauthorized page', () => {
    loggedIn.set(true);
    isAdmin.set(false);
    const result = run();
    expect(result).toBeInstanceOf(UrlTree);
    expect(serialize(result)).toBe('/unauthorized');
  });

  it('redirects guests to login with a returnUrl', () => {
    loggedIn.set(false);
    isAdmin.set(false);
    const result = run();
    expect(result).toBeInstanceOf(UrlTree);
    expect(serialize(result)).toBe('/auth/login?returnUrl=%2FadminDashboard');
  });
});
