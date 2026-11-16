import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export type CheckoutStep = 1 | 2;

const DOT_POSITIONS = [30, 75] as const;

@Component({
  selector: 'app-checkout-steps',
  imports: [TranslatePipe],
  templateUrl: './checkout-steps.html',
  styleUrl: './checkout-steps.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutSteps {
  readonly currentStep = input.required<CheckoutStep>();

  protected readonly steps = [1, 2] as const;
  protected readonly totalSteps = this.steps.length;
  protected readonly positions = DOT_POSITIONS;

  protected readonly progress = computed(() =>
    this.currentStep() === this.totalSteps
      ? 100
      : DOT_POSITIONS[this.currentStep() - 1],
  );
}
