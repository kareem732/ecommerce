import { finalPrice } from '../../../shared/utils/product-price';
import { Product } from '../interfaces/home.model/home-model-response';

export interface ProductFilters {
  categoryId: string | null;
  occasionId: string | null;
  /** Products rated at least this many stars. */
  minRating: number | null;
  /** Compared against the price after discount. */
  minPrice: number | null;
  maxPrice: number | null;
}

export const EMPTY_PRODUCT_FILTERS: ProductFilters = {
  categoryId: null,
  occasionId: null,
  minRating: null,
  minPrice: null,
  maxPrice: null,
};

export function hasActiveFilters(filters: ProductFilters): boolean {
  return Object.values(filters).some((value) => value !== null);
}

export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  const { categoryId, occasionId, minRating, minPrice, maxPrice } = filters;

  return products.filter((product) => {
    if (categoryId !== null && product.categoryId !== categoryId) return false;
    if (occasionId !== null && !product.occasions?.some((o) => o.occasionId === occasionId)) {
      return false;
    }
    if (minRating !== null && product.rating < minRating) return false;

    if (minPrice !== null || maxPrice !== null) {
      const price = finalPrice(product);
      if (minPrice !== null && price < minPrice) return false;
      if (maxPrice !== null && price > maxPrice) return false;
    }
    return true;
  });
}

type FilterParams = Partial<Record<keyof ProductFilters, string | number>>;

/** Query param naming a product whose attributes the products page should filter by. */
export const SIMILAR_TO_PARAM = 'similarTo';

const NUMERIC_FILTER_KEYS = ['minRating', 'minPrice', 'maxPrice'] as const;

/** Filters that match products like the given one: same category, first occasion, and rating floor. */
export function similarProductFilters(product: Partial<Product>): ProductFilters {
  // Defensive: some endpoints (e.g. the wishlist) return a slimmer product shape.
  const rating = Math.floor(Number(product.rating) || 0);
  return {
    ...EMPTY_PRODUCT_FILTERS,
    categoryId: product.categoryId || product.category?.id || null,
    occasionId: product.occasions?.[0]?.occasionId ?? null,
    minRating: rating > 0 ? rating : null,
  };
}

/** Serialises active filters to URL query params (inactive ones are omitted). */
export function filtersToQueryParams(filters: ProductFilters): FilterParams {
  const params: FilterParams = {};
  for (const [key, value] of Object.entries(filters) as [keyof ProductFilters, string | number | null][]) {
    if (value !== null) params[key] = value;
  }
  return params;
}

/** Reads filters back from URL query params, ignoring missing or malformed values. */
export function filtersFromQueryParams(params: { get(name: string): string | null }): ProductFilters {
  const filters: ProductFilters = {
    ...EMPTY_PRODUCT_FILTERS,
    categoryId: params.get('categoryId') || null,
    occasionId: params.get('occasionId') || null,
  };
  for (const key of NUMERIC_FILTER_KEYS) {
    const raw = params.get(key);
    const value = raw === null || raw === '' ? NaN : Number(raw);
    filters[key] = Number.isFinite(value) && value >= 0 ? value : null;
  }
  return filters;
}
