import { LucideIconData } from 'lucide-angular';
import { Product } from '../../shop/interfaces/home.model/home-model-response';

export type RecipientId = 'PARTNER' | 'MOM' | 'DAD' | 'FRIEND' | 'COLLEAGUE' | 'MYSELF';
export type BudgetId = 'UNDER_250' | 'FROM_250_TO_500' | 'FROM_500_TO_1000' | 'OVER_1000' | 'ANY';
export type MatchReason = 'OCCASION' | 'CATEGORY' | 'BUDGET' | 'TOP_RATED' | 'DEAL';

export interface RecipientOption {
  id: RecipientId;
  labelKey: string;
  icon: LucideIconData;
}

export interface BudgetRange {
  id: BudgetId;
  labelKey: string;
  min: number | null;
  max: number | null;
}

/** `null` means the user skipped the question ("Any" / "Surprise me"). */
export interface GiftAnswers {
  occasionId: string | null;
  recipient: RecipientId | null;
  budget: BudgetRange | null;
  categoryId: string | null;
}

export interface GiftMatch {
  product: Product;
  score: number;
  reasons: MatchReason[];
}

export interface GiftSearchResult {
  matches: GiftMatch[];
  /** True when filters had to be loosened to find enough gifts. */
  relaxed: boolean;
}
