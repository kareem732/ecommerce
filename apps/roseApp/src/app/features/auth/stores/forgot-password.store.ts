import { inject } from '@angular/core';
import { signalStore, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { PasswordResetService } from '@org/auth-service';
import { exhaustMap, pipe } from 'rxjs';
import { withRequestState } from '../utils/with-request-state';

export const ForgotPasswordStore = signalStore(
  withRequestState(),
  withMethods((store, service = inject(PasswordResetService)) => ({
    send: rxMethod<{ email: string; redirectUrl: string }>(
      pipe(
        exhaustMap(({ email, redirectUrl }) =>
          store.track(service.forgotPassword(email, redirectUrl)),
        ),
      ),
    ),
  })),
);