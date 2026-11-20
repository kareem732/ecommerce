import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LayoutGrid, LucideAngularModule, PartyPopper, Wallet } from 'lucide-angular';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { BackButton } from '../auth/components/back-button/back-button';
import { Stepper } from '../auth/components/stepper/stepper';
import { OccasionTitlePipe } from '../shop/pipes/occasion-title.pipe';
import { GiftResults } from './components/gift-results/gift-results';
import { OptionTile } from './components/option-tile/option-tile';
import { BUDGET_RANGES, RECIPIENT_OPTIONS } from './constants/gift-finder.constants';
import { GIFT_FINDER_QUESTIONS, GiftFinderStep } from './enums/gift-finder-step.enum';
import { GiftFinderStore } from './stores/gift-finder.store';

@Component({
  selector: 'app-gift-finder',
  imports: [
    TranslatePipe,
    LucideAngularModule,
    BackButton,
    Stepper,
    OccasionTitlePipe,
    OptionTile,
    GiftResults,
    PageHeader,
  ],
  providers: [GiftFinderStore],
  templateUrl: './gift-finder.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GiftFinder {
  protected readonly store = inject(GiftFinderStore);

  protected readonly Step = GiftFinderStep;
  protected readonly totalQuestions = GIFT_FINDER_QUESTIONS.length;
  protected readonly recipients = RECIPIENT_OPTIONS;
  protected readonly budgets = BUDGET_RANGES;
  protected readonly AnyOccasionIcon = PartyPopper;
  protected readonly AnyBudgetIcon = Wallet;
  protected readonly AnyCategoryIcon = LayoutGrid;

  /** 1-based step for the stepper; past the last question when showing results. */
  protected readonly currentStep = computed(() =>
    this.store.isResults() ? this.totalQuestions + 1 : this.store.stepIndex() + 1,
  );
  protected readonly canGoBack = computed(() => this.currentStep() > 1);
}
