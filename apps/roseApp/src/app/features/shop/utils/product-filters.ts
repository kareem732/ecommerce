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
    if (occasionId !== null && !product.occasions.some((o) => o.occasionId === occasionId)) {
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
