import {
  CartItem,
  CartItemResponse,
  CartProduct,
  CartResponse,
} from '../../../features/shop/interfaces/cart.model/cart.model';
import { daysAgo } from './product.fixtures';

export const makeCartProduct = (overrides: Partial<CartProduct> = {}): CartProduct => ({
  id: 'product-1',
  title: 'Test Product',
  description: 'Test description',
  rating: 3,
  ratings: 0,
  stock: 10,
  price: '1000',
  discountType: null,
  discountValue: null,
  cover: 'cover.webp',
  gallery: '',
  categoryId: 'category-1',
  subCategoryId: null,
  immutable: false,
  deletedAt: null,
  createdAt: daysAgo(365),
  updatedAt: daysAgo(365),
  category: { id: 'category-1', title: 'Category' },
  subCategory: null,
  ...overrides,
});

export const makeCartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  id: 'cart-item-1',
  userId: 'user-1',
  productId: 'product-1',
  quantity: 1,
  createdAt: daysAgo(1),
  updatedAt: daysAgo(1),
  product: makeCartProduct(),
  ...overrides,
});

export const makeCartResponse = (cartItems: CartItem[] = []): CartResponse => ({
  status: true,
  code: 200,
  payload: { cartItems },
});

export const makeCartItemResponse = (
  cartItem: CartItem = makeCartItem(),
  code = 200,
): CartItemResponse => ({
  status: true,
  code,
  payload: { cartItem },
});
