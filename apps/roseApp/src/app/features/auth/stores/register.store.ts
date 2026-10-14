import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { AuthError, Gender, OtpService, RegisterService } from '@org/auth-service';
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
  error: string | null;
}

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
  error: null,
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
      const run = <T>(request$: Observable<T>, onSuccess?: () => void): void => {
        patchState(store, { loading: true, error: null });

        request$
          .pipe(
            finalize(() => patchState(store, { loading: false })),
            takeUntilDestroyed(destroyRef),
          )
          .subscribe({
            next: () => onSuccess?.(),
            error: (err: AuthError) => patchState(store, { error: err.message }),
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
          error: null,
          step:
            s.step > RegisterStep.Email ? ((s.step - 1) as RegisterStep) : s.step,
        }));

      const reset = (): void => patchState(store, initialState);

      return {
        patch,
        next,
        back,
        reset,

        // Step 1: email -> send OTP
        sendCode(email: string): void {
          run(otpService.sendCode(email), () => {
            patch({ email });
            next();
          });
        },

        resendCode(): void {
          run(otpService.sendCode(store.data().email));
        },

        // Step 2: OTP
        confirmCode(code: string): void {
          run(otpService.confirmCode(store.data().email, code), next);
        },

        // Step 4: register
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
