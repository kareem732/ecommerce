import { inject } from '@angular/core';
import { signalStore, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { exhaustMap, pipe } from 'rxjs';
import { withRequestState } from '../../auth/utils/with-request-state';
import { ChangePasswordRequest } from '../interfaces/account.models';
import { AccountService } from '../services/account.service';

export const ChangePasswordStore = signalStore(
  withRequestState(),
  withMethods((store, service = inject(AccountService)) => ({
    changePassword: rxMethod<ChangePasswordRequest>(
      pipe(exhaustMap((body) => store.track(service.changePassword(body)))),
    ),
  })),
);
