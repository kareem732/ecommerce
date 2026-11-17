import { Briefcase, Heart, Smile, Sparkles, User, UserRound } from 'lucide-angular';
import { BudgetRange, GiftAnswers, RecipientOption } from '../interfaces/gift-finder.models';

export const GIFT_FINDER_PATH = '/shop/gift-finder';

export const GIFT_RESULTS_LIMIT = 8;
/** Below this many products, the search is retried with looser filters. */
export const GIFT_MIN_RESULTS = 4;
/** Page size used when fetching candidates to rank. */
export const GIFT_CANDIDATES_LIMIT = 40;

export const EMPTY_GIFT_ANSWERS: GiftAnswers = {
  occasionId: null,
  recipient: null,
  budget: null,
  categoryId: null,
};

export const RECIPIENT_OPTIONS: readonly RecipientOption[] = [
  { id: 'PARTNER', labelKey: 'GIFT_FINDER.RECIPIENTS.PARTNER', icon: Heart },
  { id: 'MOM', labelKey: 'GIFT_FINDER.RECIPIENTS.MOM', icon: UserRound },
  { id: 'DAD', labelKey: 'GIFT_FINDER.RECIPIENTS.DAD', icon: User },
  { id: 'FRIEND', labelKey: 'GIFT_FINDER.RECIPIENTS.FRIEND', icon: Smile },
  { id: 'COLLEAGUE', labelKey: 'GIFT_FINDER.RECIPIENTS.COLLEAGUE', icon: Briefcase },
  { id: 'MYSELF', labelKey: 'GIFT_FINDER.RECIPIENTS.MYSELF', icon: Sparkles },
];

export const BUDGET_RANGES: readonly BudgetRange[] = [
  { id: 'UNDER_250', labelKey: 'GIFT_FINDER.BUDGETS.UNDER_250', min: null, max: 250 },
  { id: 'FROM_250_TO_500', labelKey: 'GIFT_FINDER.BUDGETS.FROM_250_TO_500', min: 250, max: 500 },
  { id: 'FROM_500_TO_1000', labelKey: 'GIFT_FINDER.BUDGETS.FROM_500_TO_1000', min: 500, max: 1000 },
  { id: 'OVER_1000', labelKey: 'GIFT_FINDER.BUDGETS.OVER_1000', min: 1000, max: null },
];

/** Points each signal contributes to a product's match score. */
export const SCORE_WEIGHTS = {
  ratingPerStar: 10,
  popularityMax: 15,
  popularityCap: 50,
  occasion: 20,
  category: 15,
  budget: 15,
  deal: 5,
} as const;

export const TOP_RATED_THRESHOLD = 4;
