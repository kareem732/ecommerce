import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { SessionService } from '@org/auth-service';
import { Button, Textarea } from '@org/ui';
import { RatingModule } from 'primeng/rating';
import { finalize } from 'rxjs';
import { FormErrorService } from '../../../auth/utils/form-error.service';
import { ShopService } from '../../services/shop.service';

const TESTIMONIAL_MIN_LENGTH = 10;

/** Lets a customer share their experience after an order is delivered. */
@Component({
  selector: 'app-testimonial-form',
  imports: [ReactiveFormsModule, TranslatePipe, RatingModule, Button, Textarea],
  providers: [FormErrorService],
  templateUrl: './testimonial-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly shop = inject(ShopService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly user = inject(SessionService).user;
  private readonly errors = inject(FormErrorService).scope('AUTH.REGISTER.ERRORS');

  protected readonly loading = signal(false);
  protected readonly sent = signal(false);
  protected readonly authorName = computed(() => {
    const user = this.user();
    return user ? `${user.firstName} ${user.lastName}`.trim() || user.username : '';
  });

  protected readonly form = this.fb.group({
    rating: this.fb.control(0, Validators.min(1)),
    content: this.fb.control('', [Validators.required, Validators.minLength(TESTIMONIAL_MIN_LENGTH)]),
  });

  protected contentError(): string {
    return this.errors.of(this.form.controls.content);
  }

  protected submit(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();

    const { rating, content } = this.form.getRawValue();
    const email = this.user()?.email;
    this.loading.set(true);

    this.shop
      .addTestimonial({
        name: this.authorName(),
        content: content.trim(),
        rating,
        ...(email ? { email } : {}),
      })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      // Errors are toasted by the shared error interceptor; the form keeps its values for a retry.
      .subscribe(() => this.sent.set(true));
  }
}
