import { describe, expect, it } from 'vitest';
import { makeProduct } from '../../../shared/utils/testing/product.fixtures';
import { ProductOccasion } from '../../shop/interfaces/home.model/home-model-response';
import { BUDGET_RANGES, EMPTY_GIFT_ANSWERS } from '../constants/gift-finder.constants';
import { BudgetId, BudgetRange, GiftAnswers } from '../interfaces/gift-finder.models';
import { buildQueryAttempts, isWithinBudget, rankGifts, scoreProduct } from './gift-finder.utils';

const budgetById = (id: BudgetId): BudgetRange => {
  const range = BUDGET_RANGES.find((b) => b.id === id);
  if (!range) throw new Error(`Unknown budget ${id}`);
  return range;
};
const budget250to500 = budgetById('FROM_250_TO_500');

const answers = (overrides: Partial<GiftAnswers> = {}): GiftAnswers => ({
  ...EMPTY_GIFT_ANSWERS,
  ...overrides,
});

const withOccasion = (occasionId: string) =>
  [{ id: 'po-1', productId: 'product-1', occasionId, createdAt: '' }] as unknown as ProductOccasion[];

describe('buildQueryAttempts', () => {
  it('relaxes category, then occasion, then budget', () => {
    const attempts = buildQueryAttempts(
      answers({ occasionId: 'occ', categoryId: 'cat', budget: budget250to500 }),
    );

    expect(attempts).toHaveLength(4);
    expect(attempts[0]).toMatchObject({ occasionId: 'occ', categoryId: 'cat', minPrice: 250, maxPrice: 500 });
    expect(attempts[1]).not.toHaveProperty('categoryId');
    expect(attempts[1]).toMatchObject({ occasionId: 'occ', minPrice: 250 });
    expect(attempts[2]).not.toHaveProperty('occasionId');
    expect(attempts[2]).toMatchObject({ maxPrice: 500 });
    expect(attempts[3]).not.toHaveProperty('minPrice');
  });

  it('drops duplicate attempts when questions were skipped', () => {
    expect(buildQueryAttempts(answers())).toHaveLength(1);
  });
});

describe('isWithinBudget', () => {
  it('handles open-ended ranges and a missing budget', () => {
    expect(isWithinBudget(300, budget250to500)).toBe(true);
    expect(isWithinBudget(600, budget250to500)).toBe(false);
    expect(isWithinBudget(5000, budgetById('OVER_1000'))).toBe(true);
    expect(isWithinBudget(10, null)).toBe(true);
  });
});

describe('scoreProduct', () => {
  it('explains why a product matches', () => {
    const product = makeProduct({
      rating: 4.5,
      price: '400',
      categoryId: 'cat',
      occasions: withOccasion('occ'),
      discountType: 'PERCENT',
      discountValue: 10,
    });

    const { reasons } = scoreProduct(
      product,
      answers({ occasionId: 'occ', categoryId: 'cat', budget: budget250to500 }),
    );

    expect(reasons).toEqual(['OCCASION', 'CATEGORY', 'BUDGET', 'TOP_RATED', 'DEAL']);
  });

  it('scores a matching product above a non-matching one', () => {
    const wanted = answers({ occasionId: 'occ' });
    const match = scoreProduct(makeProduct({ occasions: withOccasion('occ') }), wanted);
    const other = scoreProduct(makeProduct(), wanted);

    expect(match.score).toBeGreaterThan(other.score);
  });
});

describe('rankGifts', () => {
  it('sorts by score and skips out-of-stock products', () => {
    const ranked = rankGifts(
      [
        makeProduct({ id: 'low', rating: 2 }),
        makeProduct({ id: 'sold-out', rating: 5, stock: 0 }),
        makeProduct({ id: 'high', rating: 5 }),
      ],
      answers(),
    );

    expect(ranked.map((m) => m.product.id)).toEqual(['high', 'low']);
  });
});
