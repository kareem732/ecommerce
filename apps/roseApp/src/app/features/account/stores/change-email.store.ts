import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { NotificationService } from '@org/auth-service';
import { EMPTY, catchError, exhaustMap, finalize, pipe, tap } from 'rxjs';
import { withRequestState } from '../../auth/utils/with-request-state';
import { ChangeEmailStep } from '../enums/change-email-step.enum';
import { AccountService } from '../services/account.service';

interface ChangeEmailState {
  step: ChangeEmailStep;
  newEmail: string;
  /** Bumped every time a code is sent, so the view can restart its countdown. */
  codeSentAt: number;
  resending: boolean;
  confirmed: boolean;
}

const initialState: ChangeEmailState = {
  step: ChangeEmailStep.Email,
  newEmail: '',
  codeSentAt: 0,
  resending: false,
  confirmed: false,
};

export const ChangeEmailStore = signalStore(
  withState<ChangeEmailState>(initialState),
  withRequestState(),
  withMethods((store, service = inject(AccountService), notifications = inject(NotificationService)) => ({
    requestCode: rxMethod<string>(
      pipe(
        exhaustMap((newEmail) =>
          store.track(service.requestEmailChange(newEmail)).pipe(
            tap(() =>
              patchState(store, {
                newEmail,
                step: ChangeEmailStep.Verify,
                codeSentAt: Date.now(),
              }),
            ),
          ),
        ),
      ),
    ),

    resendCode: rxMethod<void>(
      pipe(
        exhaustMap(() => {
          patchState(store, { resending: true });
          return service.requestEmailChange(store.newEmail()).pipe(
            tap(() => patchState(store, { codeSentAt: Date.now() })),
            catchError(() => EMPTY),
            finalize(() => patchState(store, { resending: false })),
          );
        }),
      ),
    ),

    confirmCode: rxMethod<string>(
      pipe(
        exhaustMap((code) =>
          store.track(service.confirmEmailChange(code)).pipe(
            tap(() => {
              notifications.success('ACCOUNT.CHANGE_EMAIL.SUCCESS');
              patchState(store, { confirmed: true });
            }),
          ),
        ),
      ),
    ),

    editEmail(): void {
      patchState(store, { step: ChangeEmailStep.Email });
    },
  })),
);
