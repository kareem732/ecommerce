import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { signalStore, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { LoginService } from '@org/auth-service';
import { exhaustMap, pipe, tap } from 'rxjs';
import { withRequestState } from '../utils/with-request-state';

export interface LoginParams {
  username: string;
  password: string;
  remember: boolean;
  returnUrl: string;
}

export const LoginStore = signalStore(
  withRequestState(),
  withMethods((store, loginService = inject(LoginService), router = inject(Router)) => ({
    login: rxMethod<LoginParams>(
      pipe(
        exhaustMap(({ username, password, remember, returnUrl }) =>
          store
            .track(loginService.login({ username, password }, remember))
            .pipe(tap(() => void router.navigateByUrl(returnUrl))),
        ),
      ),
    ),
  })),
);