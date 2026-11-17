import { finalPrice, hasDiscount, isOutOfStock } from '../../../shared/utils/product-price';
import { ProductSortBy, SortOrder } from '../../shop/enums/product-sort';
import { ProductsQuery } from '../../shop/interfaces/home.model/home-model-request';
import { Product } from '../../shop/interfaces/home.model/home-model-response';
import {
  GIFT_CANDIDATES_LIMIT,
  GIFT_RESULTS_LIMIT,
  SCORE_WEIGHTS,
  TOP_RATED_THRESHOLD,
} from '../constants/gift-finder.constants';
import { BudgetRange, GiftAnswers, GiftMatch, MatchReason } from '../interfaces/gift-finder.models';

const baseQuery: ProductsQuery = {
  page: 1,
  limit: GIFT_CANDIDATES_LIMIT,
  sortBy: ProductSortBy.RATING,
  sortOrder: SortOrder.DESC,
};

const priceQuery = (budget: BudgetRange | null): ProductsQuery => ({
  ...(budget?.min != null ? { minPrice: budget.min } : {}),
  ...(budget?.max != null ? { maxPrice: budget.max } : {}),
});

/**
 * Queries to try in order, from the strictest to the loosest: the category is
 * dropped first, then the occasion, and finally the budget.
 */
export function buildQueryAttempts({ occasionId, categoryId, budget }: GiftAnswers): ProductsQuery[] {
  const occasion = occasionId ? { occasionId } : {};
  const category = categoryId ? { categoryId } : {};
  const price = priceQuery(budget);

  const attempts: ProductsQuery[] = [
    { ...baseQuery, ...occasion, ...category, ...price },
    { ...baseQuery, ...occasion, ...price },
    { ...baseQuery, ...price },
    { ...baseQuery },
  ];

  const unique = new Map(attempts.map((query) => [JSON.stringify(query), query]));
  return [...unique.values()];
}

export function isWithinBudget(price: number, budget: BudgetRange | null): boolean {
  if (!budget) return true;
  return (budget.min == null || price >= budget.min) && (budget.max == null || price <= budget.max);
}

export function scoreProduct(product: Product, answers: GiftAnswers): GiftMatch {
  const reasons: MatchReason[] = [];
  const rating = Number(product.rating) || 0;
  const ratingsCount = Number(product.ratings) || 0;

  let score =
    rating * SCORE_WEIGHTS.ratingPerStar +
    (Math.min(ratingsCount, SCORE_WEIGHTS.popularityCap) / SCORE_WEIGHTS.popularityCap) *
      SCORE_WEIGHTS.popularityMax;

  if (answers.occasionId && product.occasions?.some((o) => o.occasionId === answers.occasionId)) {
    score += SCORE_WEIGHTS.occasion;
    reasons.push('OCCASION');
  }

  const categoryId = product.categoryId || product.category?.id;
  if (answers.categoryId && categoryId === answers.categoryId) {
    score += SCORE_WEIGHTS.category;
    reasons.push('CATEGORY');
  }

  if (answers.budget && isWithinBudget(finalPrice(product), answers.budget)) {
    score += SCORE_WEIGHTS.budget;
    reasons.push('BUDGET');
  }

  if (rating >= TOP_RATED_THRESHOLD) reasons.push('TOP_RATED');

  if (hasDiscount(product)) {
    score += SCORE_WEIGHTS.deal;
    reasons.push('DEAL');
  }

  return { product, score, reasons };
}

/** Scores, filters out-of-stock items and returns the best matches first. */
export function rankGifts(products: Product[], answers: GiftAnswers): GiftMatch[] {
  return products
    .filter((product) => !isOutOfStock(product))
    .map((product) => scoreProduct(product, answers))
    .sort((a, b) => b.score - a.score)
    .slice(0, GIFT_RESULTS_LIMIT);
}
