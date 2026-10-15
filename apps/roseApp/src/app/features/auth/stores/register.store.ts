import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Gender, OtpService, RegisterService } from '@org/auth-service';
import { Observable, finalize } from 'rxjs';
import { RegisterStep } from '../enums/register-step.enum';

export interface RegisterData {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  gender: Gender | '';
}

interface RegisterState {
  step: RegisterStep;
  data: RegisterData;
  loading: boolean;
  resending: boolean;
}

type BusyFlag = 'loading' | 'resending';

const EMPTY_DATA: RegisterData = {
  email: '',
  firstName: '',
  lastName: '',
  username: '',
  phone: '',
  gender: '',
};

const initialState: RegisterState = {
  step: RegisterStep.Email,
  data: EMPTY_DATA,
  loading: false,
  resending: false,
};

export const RegisterStore = signalStore(
  withState<RegisterState>(initialState),
  withMethods(
    (
      store,
      otpService = inject(OtpService),
      registerService = inject(RegisterService),
      destroyRef = inject(DestroyRef),
    ) => {
      const setBusy = (flag: BusyFlag, value: boolean): void =>
        patchState(store, flag === 'loading' ? { loading: value } : { resending: value });

      const run = <T>(
        request$: Observable<T>,
        onSuccess?: () => void,
        flag: BusyFlag = 'loading',
      ): void => {
        if (store.loading() || store.resending()) return;

        setBusy(flag, true);

        request$
          .pipe(
            finalize(() => setBusy(flag, false)),
            takeUntilDestroyed(destroyRef),
          )
          .subscribe({
            next: () => onSuccess?.(),
          });
      };

      const patch = (partial: Partial<RegisterData>): void =>
        patchState(store, (s) => ({ data: { ...s.data, ...partial } }));

      const next = (): void =>
        patchState(store, (s) => ({
          step: Math.min(s.step + 1, RegisterStep.Password) as RegisterStep,
        }));

      const back = (): void =>
        patchState(store, (s) => ({
          step: s.step > RegisterStep.Email ? ((s.step - 1) as RegisterStep) : s.step,
        }));

      const reset = (): void => patchState(store, initialState);

      return {
        patch,
        next,
        back,
        reset,

        sendCode(email: string): void {
          run(otpService.sendCode(email), () => {
            patch({ email });
            next();
          });
        },

        resendCode(onSuccess?: () => void): void {
          run(otpService.sendCode(store.data().email), onSuccess, 'resending');
        },

        confirmCode(code: string): void {
          run(otpService.confirmCode(store.data().email, code), next);
        },

        register(
          credentials: { password: string; confirmPassword: string },
          onSuccess?: () => void,
        ): void {
          const { phone, gender, ...rest } = store.data();

          if (!gender) return;

          run(
            registerService.register({
              ...rest,
              gender,
              phone: phone || undefined,
              password: credentials.password,
              confirmPassword: credentials.confirmPassword,
            }),
            () => {
              reset();
              onSuccess?.();
            },
          );
        },
      };
    },
  ),
);
