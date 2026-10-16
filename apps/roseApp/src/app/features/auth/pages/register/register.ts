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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Gender } from '@org/auth-service';
import { LanguageService } from '@org/shared-i18n';
import { Button, Input, Otp, Phone, Select } from '@org/ui';
import { ArrowLeft, ArrowRight } from 'lucide-angular';
import { map } from 'rxjs';
import { BackButton } from '../../components/back-button/back-button';
import { Stepper } from '../../components/stepper/stepper';
import { AuthRoute } from '../../enums/auth-route.enum';
import { RegisterStep } from '../../enums/register-step.enum';
import { EmailForm, PasswordForm, ProfileForm } from '../../interfaces/register-forms.interface';
import { RegisterStore } from '../../stores/register.store';
import { STRONG_PASSWORD, fieldsMatch, optionalPhone } from '../../utils/auth-validators';
import { FormErrorService } from '../../utils/form-error.service';

const RESEND_COOLDOWN_SECONDS = 60;
const OTP_LENGTH = 6;

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    BackButton,
    Button,
    Input,
    Otp,
    Phone,
    Select,
    Stepper,
  ],
  providers: [RegisterStore, FormErrorService],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly language = inject(LanguageService);
  private readonly errors = inject(FormErrorService).scope('AUTH.REGISTER.ERRORS');

  protected readonly store = inject(RegisterStore);
  protected readonly Step = RegisterStep;
  protected readonly Route = AuthRoute;
  protected readonly OTP_LENGTH = OTP_LENGTH;
  protected readonly parent = this.route.parent ?? undefined;
  protected readonly loading = this.store.loading;
  protected readonly resending = this.store.resending;
  protected readonly errorOf = this.errors.of;

  // السهم بيتعكس في العربي
  protected readonly NextIcon = computed(() =>
    this.language.direction() === 'rtl' ? ArrowLeft : ArrowRight,
  );

  private readonly otp = viewChild(Otp);

  protected readonly otpCode = signal('');
  protected readonly resendSeconds = signal(0);
  private timerId?: ReturnType<typeof setInterval>;

  protected readonly genderOptions = signal<{ value: string; label: string }[]>([]);

  protected readonly emailForm = this.fb.group<EmailForm>({
    email: this.fb.control('', [Validators.required, Validators.email]),
  });

  protected readonly profileForm = this.fb.group<ProfileForm>({
    firstName: this.fb.control('', Validators.required),
    lastName: this.fb.control('', Validators.required),
    username: this.fb.control('', [Validators.required, Validators.minLength(3)]),
    phone: this.fb.control('', optionalPhone),
    gender: this.fb.control<Gender | ''>('', Validators.required),
  });

  protected readonly passwordForm = this.fb.group<PasswordForm>(
    {
      password: this.fb.control('', [Validators.required, Validators.pattern(STRONG_PASSWORD)]),
      confirmPassword: this.fb.control('', Validators.required),
    },
    { validators: fieldsMatch('password', 'confirmPassword') },
  );

  constructor() {
    const saved = this.store.data();
    this.emailForm.patchValue({ email: saved.email });
    this.profileForm.patchValue({
      firstName: saved.firstName,
      lastName: saved.lastName,
      username: saved.username,
      phone: saved.phone,
      gender: saved.gender,
    });

    this.translate
      .stream(['AUTH.REGISTER.MALE', 'AUTH.REGISTER.FEMALE'])
      .pipe(
        map((t: Record<string, string>) => [
          { value: 'MALE', label: t['AUTH.REGISTER.MALE'] },
          { value: 'FEMALE', label: t['AUTH.REGISTER.FEMALE'] },
        ]),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((options) => this.genderOptions.set(options));

    effect(() => {
      if (this.store.step() === RegisterStep.Otp) {
        untracked(() => this.startCountdown());
      } else {
        untracked(() => {
          this.stopCountdown();
          this.otpCode.set('');
        });
      }
    });

    this.destroyRef.onDestroy(() => this.stopCountdown());
  }

  protected confirmError(): string {
    return this.errors.confirm(this.passwordForm, this.passwordForm.controls.confirmPassword);
  }

  private get busy(): boolean {
    return this.loading() || this.resending();
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
    if (this.timerId !== undefined) {
      clearInterval(this.timerId);
      this.timerId = undefined;
    }
  }

  // Step 1: email -> send OTP
  protected submitEmail(): void {
    if (this.busy) return;
    if (this.emailForm.invalid) return this.emailForm.markAllAsTouched();
    this.store.sendCode(this.emailForm.getRawValue().email);
  }

  protected resendCode(): void {
    if (this.busy || this.resendSeconds() > 0) return;
    this.store.resendCode(() => {
      this.otp()?.clear();
      this.startCountdown();
    });
  }

  // Step 2: verify
  protected submitOtp(code: string): void {
    if (code.length !== OTP_LENGTH || this.busy) return;
    this.store.confirmCode(code);
  }

  // Step 3: profile
  protected submitProfile(): void {
    if (this.profileForm.invalid) return this.profileForm.markAllAsTouched();

    this.store.patch(this.profileForm.getRawValue());
    this.store.next();
  }

  // Step 4: password -> register -> login
  protected submitPassword(): void {
    if (this.busy) return;
    if (this.passwordForm.invalid) return this.passwordForm.markAllAsTouched();

    this.store.register(this.passwordForm.getRawValue(), () => {
      void this.router.navigate([AuthRoute.Login], { relativeTo: this.parent });
    });
  }

  protected back(): void {
    if (this.busy) return;
    this.store.back();
  }
}
