import { Product } from '../home.model/home-model-response';

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: Product;
}

export interface WishlistResponse {
  status: boolean;
  code: number;
  payload: {
    wishlistItems: WishlistItem[];
  };
}

export interface WishlistMessageResponse {
  status: boolean;
  code: number;
  message?: string;
}
