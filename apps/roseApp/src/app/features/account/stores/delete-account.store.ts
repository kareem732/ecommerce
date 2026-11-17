import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { signalStore, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { LoginService } from '@org/auth-service';
import { exhaustMap, pipe, tap } from 'rxjs';
import { withRequestState } from '../../auth/utils/with-request-state';
import { AccountService } from '../services/account.service';

export const DeleteAccountStore = signalStore(
  withRequestState(),
  withMethods(
    (
      store,
      service = inject(AccountService),
      loginService = inject(LoginService),
      router = inject(Router),
    ) => ({
      deleteAccount: rxMethod<void>(
        pipe(
          exhaustMap(() =>
            store.track(service.deleteAccount()).pipe(
              tap(() => {
                loginService.logout();
                router.navigate(['/auth/login']);
              }),
            ),
          ),
        ),
      ),
    }),
  ),
);
