import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { SessionService } from '@org/auth-service';
import { EMPTY, Observable, catchError, exhaustMap, pipe, switchMap, tap } from 'rxjs';
import { withRequestState } from '../../auth/utils/with-request-state';
import { ProfileUpdate, UserProfile } from '../interfaces/account.models';
import { AccountService } from '../services/account.service';

interface ProfileState {
  profile: UserProfile | null;
}

export const ProfileStore = signalStore(
  withState<ProfileState>({ profile: null }),
  withRequestState(),
  withMethods(
    (store, service = inject(AccountService), session = inject(SessionService)) => {
      const applyProfile = (profile: UserProfile): void => {
        patchState(store, { profile });
        session.setUser(profile);
      };

      const saveProfile = ({ changes, photo }: ProfileUpdate): Observable<UserProfile> =>
        photo
          ? service
              .uploadPhoto(photo)
              .pipe(switchMap((url) => service.updateProfile({ ...changes, photo: url })))
          : service.updateProfile(changes);

      return {
        loadProfile: rxMethod<void>(
          pipe(
            switchMap(() =>
              service.getProfile().pipe(
                tap(applyProfile),
                catchError(() => EMPTY),
              ),
            ),
          ),
        ),
        updateProfile: rxMethod<ProfileUpdate>(
          pipe(exhaustMap((update) => store.track(saveProfile(update)).pipe(tap(applyProfile)))),
        ),
      };
    },
  ),
);
