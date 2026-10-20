import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LoginService } from '@org/auth-service';
import { Button, Checkbox, Input } from '@org/ui';
import { finalize } from 'rxjs';
import { AuthRoute } from '../../enums/auth-route.enum';
import { LoginForm } from '../../interfaces/login-form.interface';

const DEFAULT_REDIRECT = '/shop/home';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, Button, Checkbox, Input],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loginService = inject(LoginService);

  protected readonly Route = AuthRoute;
  protected readonly parent = this.route.parent ?? undefined;
  protected readonly loading = signal(false);

  protected readonly form = this.fb.group<LoginForm>({
    username: this.fb.control('', Validators.required),
    password: this.fb.control('', Validators.required),
    remember: this.fb.control(false),
  });

  protected errorOf(control: AbstractControl | null): string {
    return control?.touched && control.hasError('required')
      ? this.translate.instant('AUTH.LOGIN.ERRORS.REQUIRED')
      : '';
  }

  protected submit(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();

    const { username, password, remember } = this.form.getRawValue();
    this.loading.set(true);

    this.loginService
      .login({ username: username.trim(), password }, remember)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
  void this.router.navigateByUrl(this.returnUrl());
},
        error: () => undefined,
      });
  }

  private returnUrl(): string {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');
    const isInternal = !!url && url.startsWith('/') && !url.startsWith('//');
    return isInternal ? url : DEFAULT_REDIRECT;
  }
}
