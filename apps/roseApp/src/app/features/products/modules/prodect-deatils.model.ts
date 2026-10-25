export interface IProduct {
  id: string;
  title: string;
  description: string;
  rating: number;
  ratings: number;
  stock: number;
  price: string;
  discountType: string;
  discountValue: string;
  cover: string;
  gallery: string;
  categoryId: string;
  subCategoryId: null;
  immutable: boolean;
  deletedAt: null;
  createdAt: string;
  updatedAt: string;
  category: ICategory;
  subCategory: null;
  occasions: unknown[];
  reviews: unknown[];
  _count: ICount;
}

export interface ICategory {
  id: string;
  title: string;
  description: string;
  image: string;
  immutable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICount {
  reviews: number;
  cartItems: number;
  wishlistItems: number;
}

export interface IProductPayLoad {
  product: IProduct;
}

export interface IProductResponse {
  status: boolean;
  code: number;
  payload: IProduct;
}

export type ProductDetailsState =
  'loading' | 'success' | 'error' | 'not-found' | 'missing-id';
