import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Gender } from '@org/auth-service';
import { Button, Input, Otp, Phone, Select } from '@org/ui';
import { map } from 'rxjs';
import { BackButton } from '../../components/back-button/back-button';
import { Stepper } from '../../components/stepper/stepper';
import { AuthRoute } from '../../enums/auth-route.enum';
import { RegisterStep } from '../../enums/register-step.enum';
import { EmailForm, PasswordForm, ProfileForm } from '../../interfaces/register-forms.interface';
import { RegisterStore } from '../../stores/register.store';
import { STRONG_PASSWORD, fieldsMatch, optionalPhone } from '../../utils/auth-validators';
import { FormErrorService } from '../../utils/form-error.service';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
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
  private readonly errors = inject(FormErrorService).scope('AUTH.REGISTER.ERRORS');

  protected readonly store = inject(RegisterStore);
  protected readonly Step = RegisterStep;
  protected readonly Route = AuthRoute;
  protected readonly parent = this.route.parent ?? undefined;
  protected readonly loading = this.store.loading;
  protected readonly errorOf = this.errors.of;

  protected readonly otpCode = signal('');

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
  }

  protected confirmError(): string {
    return this.errors.confirm(this.passwordForm, this.passwordForm.controls.confirmPassword);
  }

  // Step 1: email -> send OTP
  protected submitEmail(): void {
    if (this.emailForm.invalid) return this.emailForm.markAllAsTouched();
    this.store.sendCode(this.emailForm.getRawValue().email);
  }

  protected resendCode(): void {
    this.otpCode.set('');
    this.store.resendCode();
  }

  // Step 2: OTP
  protected submitOtp(code: string): void {
    if (!code) return;
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
    if (this.passwordForm.invalid) return this.passwordForm.markAllAsTouched();

    this.store.register(this.passwordForm.getRawValue(), () => {
      void this.router.navigate([AuthRoute.Login], { relativeTo: this.parent });
    });
  }

  protected back(): void {
    this.otpCode.set('');
    this.store.back();
  }
}
