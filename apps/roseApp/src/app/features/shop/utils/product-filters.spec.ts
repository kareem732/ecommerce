import { makeOccasion, makeProduct } from '../../../shared/utils/testing/product.fixtures';
import { ProductOccasion } from '../interfaces/home.model/home-model-response';
import {
  EMPTY_PRODUCT_FILTERS,
  filterProducts,
  filtersFromQueryParams,
  filtersToQueryParams,
  hasActiveFilters,
  similarProductFilters,
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

describe('similarProductFilters', () => {
  it('matches category, first occasion and the rating floor', () => {
    const product = makeProduct({
      id: 'p',
      categoryId: 'flowers',
      rating: 4.5,
      occasions: [linkOccasion('p', 'wedding'), linkOccasion('p', 'birthday')],
    });

    expect(similarProductFilters(product)).toEqual({
      ...EMPTY_PRODUCT_FILTERS,
      categoryId: 'flowers',
      occasionId: 'wedding',
      minRating: 4,
    });
  });

  it('copes with the slimmer wishlist product shape (no occasions, category only as a ref)', () => {
    const slim = { id: 'p', rating: 3.2, category: { id: 'flowers', title: 'Flowers' } };

    expect(similarProductFilters(slim)).toEqual({
      ...EMPTY_PRODUCT_FILTERS,
      categoryId: 'flowers',
      minRating: 3,
    });
  });

  it('leaves occasion and rating unset when the product has none', () => {
    const product = makeProduct({ id: 'p', categoryId: 'flowers', rating: 0, occasions: [] });

    expect(similarProductFilters(product)).toEqual({ ...EMPTY_PRODUCT_FILTERS, categoryId: 'flowers' });
  });
});

describe('filter query params', () => {
  const params = (values: Record<string, string>) => ({ get: (name: string) => values[name] ?? null });

  it('omits inactive filters when serialising', () => {
    expect(filtersToQueryParams({ ...EMPTY_PRODUCT_FILTERS, categoryId: 'flowers', minPrice: 0 })).toEqual({
      categoryId: 'flowers',
      minPrice: 0,
    });
  });

  it('round-trips through the URL', () => {
    const filters = { categoryId: 'flowers', occasionId: 'wedding', minRating: 4, minPrice: 10, maxPrice: 500 };
    const serialised = Object.fromEntries(
      Object.entries(filtersToQueryParams(filters)).map(([key, value]) => [key, String(value)]),
    );

    expect(filtersFromQueryParams(params(serialised))).toEqual(filters);
  });

  it('ignores malformed numeric params', () => {
    expect(filtersFromQueryParams(params({ minRating: 'abc', maxPrice: '-5', minPrice: '' }))).toEqual(
      EMPTY_PRODUCT_FILTERS,
    );
  });
});
