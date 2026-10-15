import { inject } from '@angular/core';
import { signalStore, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { PasswordResetService } from '@org/auth-service';
import { exhaustMap, pipe } from 'rxjs';
import { withRequestState } from '../utils/with-request-state';

export interface ResetPasswordParams {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export const ResetPasswordStore = signalStore(
  withRequestState(),
  withMethods((store, service = inject(PasswordResetService)) => ({
    resetPassword: rxMethod<ResetPasswordParams>(
      pipe(exhaustMap((params) => store.track(service.resetPassword(params)))),
    ),
  })),
);
