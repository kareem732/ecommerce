export interface ApiResponse<T> {
  status: boolean;
  code: number;
  message?: string;
  payload: T;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedPayload<T> {
  data: T[];
  metadata: Pagination;
}

export interface CategoryRef {
  id: string;
  title: string;
}

export interface Occasion {
  id: string;
  title: string;
  description: string;
  image: string | null;
  immutable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductOccasion {
  id: string;
  productId: string;
  occasionId: string;
  createdAt: string;
  occasion: Occasion;
}

export interface ProductCount {
  reviews: number;
  cartItems: number;
  wishlistItems: number;
  orderItems: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  rating: number;
  ratings: number;
  stock: number;
  price: string;
  discountType: 'PERCENT' | null;
  discountValue: string | null;
  cover: string;
  gallery: string;
  categoryId: string;
  subCategoryId: string | null;
  immutable: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category: CategoryRef;
  subCategory: CategoryRef | null;
  occasions: ProductOccasion[];
  _count: ProductCount;
}

export type ProductsResponse = ApiResponse<PaginatedPayload<Product>>;
export type OccasionsResponse = ApiResponse<PaginatedPayload<Occasion>>;
