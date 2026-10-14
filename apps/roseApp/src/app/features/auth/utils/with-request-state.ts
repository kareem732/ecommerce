import { computed } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { EMPTY, Observable, catchError, defer, tap } from 'rxjs';

export type RequestStatus = 'idle' | 'pending' | 'success' | 'error';

export interface RequestState {
  status: RequestStatus;
  error: string | null;
}

const FALLBACK_MESSAGE = 'Something went wrong.';

export function toErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  return FALLBACK_MESSAGE;
}

export function withRequestState() {
  return signalStoreFeature(
    withState<RequestState>({ status: 'idle', error: null }),
    withComputed(({ status }) => ({
      loading: computed(() => status() === 'pending'),
      succeeded: computed(() => status() === 'success'),
    })),
    withMethods((store) => ({
      track<T>(source$: Observable<T>): Observable<T> {
        return defer(() => {
          patchState(store, { status: 'pending', error: null });
          return source$;
        }).pipe(
          tap({
            next: () => patchState(store, { status: 'success' }),
            error: (error: unknown) =>
              patchState(store, { status: 'error', error: toErrorMessage(error) }),
          }),
          catchError(() => EMPTY),
        );
      },
      clearError(): void {
        patchState(store, { status: 'idle', error: null });
      },
    })),
  );
}