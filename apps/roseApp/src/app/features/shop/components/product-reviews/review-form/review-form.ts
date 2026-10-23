import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Button, Input, Textarea } from '@org/ui';
import { RatingModule } from 'primeng/rating';
import { finalize } from 'rxjs';
import { ShopService } from '../../../services/shop.service';
import { REVIEW_CONTENT_MAX_LENGTH, REVIEW_HEADLINE_MAX_LENGTH } from '../product-reviews.constants';

@Component({
  selector: 'app-review-form',
  imports: [ReactiveFormsModule, TranslatePipe, RatingModule, Button, Input, Textarea],
  templateUrl: './review-form.html',
  styleUrl: './review-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly shopService = inject(ShopService);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly productId = input.required<string>();
  readonly submitted = output<void>();

  protected readonly loading = signal(false);
  protected readonly success = signal(false);

  protected readonly form = this.fb.group({
    rating: this.fb.control(0, [Validators.min(1)]),
    headline: this.fb.control('', [
      Validators.required,
      Validators.maxLength(REVIEW_HEADLINE_MAX_LENGTH),
    ]),
    content: this.fb.control('', [Validators.maxLength(REVIEW_CONTENT_MAX_LENGTH)]),
  });

  protected submit(): void {
    this.success.set(false);
    if (this.form.invalid) return this.form.markAllAsTouched();

    const { rating, headline, content } = this.form.getRawValue();
    this.loading.set(true);

    this.shopService
      .addReview({
        productId: this.productId(),
        rating,
        headline: headline.trim(),
        ...(content.trim() ? { content: content.trim() } : {}),
      })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      // Failures are reported by the shared error interceptor; the form keeps its values for a retry.
      .subscribe(() => {
        this.form.reset();
        this.success.set(true);
        this.submitted.emit();
      });
  }

  protected errorOf(control: AbstractControl, field: 'HEADLINE' | 'CONTENT'): string {
    if (!control.touched || control.valid) return '';
    if (control.hasError('required')) {
      return this.translate.instant(`SHOP.REVIEWS.FORM.ERRORS.${field}_REQUIRED`);
    }
    const max = field === 'HEADLINE' ? REVIEW_HEADLINE_MAX_LENGTH : REVIEW_CONTENT_MAX_LENGTH;
    return this.translate.instant('SHOP.REVIEWS.FORM.ERRORS.MAX_LENGTH', { max });
  }
}
