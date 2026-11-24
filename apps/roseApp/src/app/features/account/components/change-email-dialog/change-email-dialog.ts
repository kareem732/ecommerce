import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '@org/shared-i18n';
import { Button, Input, Otp } from '@org/ui';
import { ArrowLeft, ArrowRight, LucideAngularModule, X } from 'lucide-angular';
import { Stepper } from '../../../auth/components/stepper/stepper';
import { FormErrorService } from '../../../auth/utils/form-error.service';
import { ChangeEmailStep } from '../../enums/change-email-step.enum';
import { ChangeEmailStore } from '../../stores/change-email.store';

export interface ChangeEmailDialogData {
  currentEmail: string;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

@Component({
  selector: 'app-change-email-dialog',
  imports: [ReactiveFormsModule, TranslatePipe, LucideAngularModule, Button, Input, Otp, Stepper],
  providers: [ChangeEmailStore, FormErrorService],
  templateUrl: './change-email-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeEmailDialog {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  private readonly data = inject<ChangeEmailDialogData>(DIALOG_DATA);
  private readonly language = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly errors = inject(FormErrorService).scope('ACCOUNT.ERRORS');

  protected readonly store = inject(ChangeEmailStore);
  protected readonly Step = ChangeEmailStep;
  protected readonly OTP_LENGTH = OTP_LENGTH;
  protected readonly X = X;

  protected readonly loading = this.store.loading;
  protected readonly resending = this.store.resending;
  protected readonly dir = computed(() => (this.language.isRTL() ? 'rtl' : 'ltr'));
  protected readonly NextIcon = computed(() => (this.language.isRTL() ? ArrowLeft : ArrowRight));

  private readonly otp = viewChild(Otp);
  protected readonly otpCode = signal('');
  protected readonly resendSeconds = signal(0);
  private timerId?: ReturnType<typeof setInterval>;

  protected readonly form = this.fb.group({
    email: this.fb.control('', [Validators.required, Validators.email]),
  });

  constructor() {
    // Every successful send (first request or resend) restarts the cooldown and clears the boxes.
    effect(() => {
      if (!this.store.codeSentAt()) return;
      untracked(() => {
        this.otp()?.clear();
        this.otpCode.set('');
        this.startCountdown();
      });
    });

    effect(() => {
      if (this.store.confirmed()) untracked(() => this.dialogRef.close(true));
    });

    this.destroyRef.onDestroy(() => this.stopCountdown());
  }

  protected emailError(): string {
    return this.errors.of(this.form.controls.email);
  }

  protected submitEmail(): void {
    if (this.loading()) return;
    if (this.form.invalid) return this.form.markAllAsTouched();

    const email = this.form.getRawValue().email.trim();
    if (email.toLowerCase() === this.data.currentEmail.toLowerCase()) {
      this.form.controls.email.setErrors({ sameEmail: true });
      return;
    }
    this.store.requestCode(email);
  }

  protected sameEmail(): boolean {
    return this.form.controls.email.hasError('sameEmail');
  }

  protected resendCode(): void {
    if (this.loading() || this.resending() || this.resendSeconds() > 0) return;
    this.store.resendCode();
  }

  protected submitCode(): void {
    const code = this.otpCode();
    if (code.length !== OTP_LENGTH || this.loading() || this.resending()) return;
    this.store.confirmCode(code);
  }

  protected editEmail(): void {
    if (this.loading() || this.resending()) return;
    this.stopCountdown();
    this.store.editEmail();
  }

  protected close(): void {
    this.dialogRef.close(false);
  }

  private startCountdown(): void {
    this.stopCountdown();
    this.resendSeconds.set(RESEND_COOLDOWN_SECONDS);
    this.timerId = setInterval(() => {
      this.resendSeconds.update((s) => s - 1);
      if (this.resendSeconds() <= 0) this.stopCountdown();
    }, 1000);
  }

  private stopCountdown(): void {
    if (this.timerId === undefined) return;
    clearInterval(this.timerId);
    this.timerId = undefined;
  }
}
