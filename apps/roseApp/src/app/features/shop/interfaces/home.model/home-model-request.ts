import { ProductSortBy, SortOrder } from '../../enums/product-sort';

export interface ProductsQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  subCategoryId?: string;
  occasionId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: ProductSortBy;
  sortOrder?: SortOrder;
  search?: string;
}
