import { makeOccasion, makeProduct } from '../../../shared/utils/testing/product.fixtures';
import { ProductOccasion } from '../interfaces/home.model/home-model-response';
import {
  EMPTY_PRODUCT_FILTERS,
  filterProducts,
  hasActiveFilters,
} from './product-filters';

const linkOccasion = (productId: string, id: string, title = id): ProductOccasion => ({
  id: `${productId}-${id}`,
  productId,
  occasionId: id,
  createdAt: '',
  occasion: makeOccasion({ id, title }),
});

const flowers = { id: 'flowers', title: 'Flowers' };
const cards = { id: 'cards', title: 'Cards' };

const rose = makeProduct({
  id: 'rose',
  categoryId: 'flowers',
  category: flowers,
  rating: 4.5,
  price: '300',
  discountValue: 50, // final price 150
  occasions: [linkOccasion('rose', 'wedding')],
});
const card = makeProduct({
  id: 'card',
  categoryId: 'cards',
  category: cards,
  rating: 2,
  price: '50',
  occasions: [linkOccasion('card', 'birthday'), linkOccasion('card', 'wedding')],
});
const tulip = makeProduct({
  id: 'tulip',
  categoryId: 'flowers',
  category: flowers,
  rating: 3,
  price: '500',
});
const all = [rose, card, tulip];
const ids = (list: { id: string }[]) => list.map((p) => p.id);

describe('filterProducts', () => {
  it('returns everything when no filter is set', () => {
    expect(filterProducts(all, EMPTY_PRODUCT_FILTERS)).toEqual(all);
  });

  it('filters by category', () => {
    expect(ids(filterProducts(all, { ...EMPTY_PRODUCT_FILTERS, categoryId: 'flowers' }))).toEqual([
      'rose',
      'tulip',
    ]);
  });

  it('filters by occasion', () => {
    expect(ids(filterProducts(all, { ...EMPTY_PRODUCT_FILTERS, occasionId: 'wedding' }))).toEqual([
      'rose',
      'card',
    ]);
  });

  it('keeps products rated at least the minimum rating', () => {
    expect(ids(filterProducts(all, { ...EMPTY_PRODUCT_FILTERS, minRating: 3 }))).toEqual([
      'rose',
      'tulip',
    ]);
  });

  it('compares the price range against the discounted price', () => {
    const filters = { ...EMPTY_PRODUCT_FILTERS, minPrice: 100, maxPrice: 200 };
    expect(ids(filterProducts(all, filters))).toEqual(['rose']);
  });

  it('combines filters', () => {
    const filters = { ...EMPTY_PRODUCT_FILTERS, categoryId: 'flowers', minPrice: 400 };
    expect(ids(filterProducts(all, filters))).toEqual(['tulip']);
  });
});

describe('hasActiveFilters', () => {
  it('is false for the empty filters and true once any filter is set', () => {
    expect(hasActiveFilters(EMPTY_PRODUCT_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...EMPTY_PRODUCT_FILTERS, minPrice: 0 })).toBe(true);
  });
});
