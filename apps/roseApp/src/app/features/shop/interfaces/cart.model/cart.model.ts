// import { ApiResponse } from '../home.model/home-model-response';

// export interface AddToCartRequest {
//   productId: string;
//   quantity: number;
// }

// export interface CartItem {
//   id?: string;
//   userId: string;
//   productId?: string;
//   quantity?: number;
//   createdAt: string;
//   updatedAt: string;
//   product: {
//     id: string;
//     title: string;
//     description: string;
//     rating: number;
//     ratings: number;
//     stock: number;
//     price: string;
//     discountType: string | null;
//     discountValue: string | null;
//     cover: string;
//     gallery: string;
//     categoryId: string;
//     subCategoryId: string | null;
//     immutable: boolean;
//     deletedAt: string | null;
//     createdAt: string;
//     updatedAt: string;
//     category: {
//       id: string;
//       title: string;
//     };
//     subCategory: {
//       id: string;
//       title: string;
//     } | null;
//   };
// }

// export interface CartSummary {
//   cartItems: CartItem[];
//   items?: CartItem[];
//   data?: CartItem[];
//   count?: number;
//   totalItems?: number;
//   totalQuantity?: number;
// }

// export interface removeItem {
//   status: boolean;
//   code: number;
//   message: string;
//   payload: string;
// }

// export interface UpdateCartRequest {
//   quantity: number;
// }

// export interface updateCartResponse {
//   status: boolean;
//   code: number;
//   message: string;
//   payload: string;
// }

// export type CartPayload = CartSummary | CartItem[];

// export type CartResponse = ApiResponse<CartPayload>;

// export type AddToCartResponse = ApiResponse<unknown>;
import { ApiResponse, Product } from '../home.model/home-model-response';
export type CartProduct = Omit<Product, 'discountValue' | 'occasions' | '_count'> & {
  discountValue: string | null;
};

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: CartProduct;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartRequest {
  quantity: number;
}

/** Reply of the endpoints that return no data (remove item, clear cart). */
export interface CartMessageResponse {
  status: boolean;
  code: number;
  message?: string;
}

export type CartResponse = ApiResponse<{ cartItems: CartItem[] }>;

export type CartItemResponse = ApiResponse<{ cartItem: CartItem }>;

export type AddToCartResponse = CartItemResponse;
export type UpdateCartResponse = CartItemResponse;
