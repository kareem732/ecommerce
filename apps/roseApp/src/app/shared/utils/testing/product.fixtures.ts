import { Occasion,OccasionsResponse,Product,ProductsResponse} from '../../../features/shop/interfaces/home.model/home-model-response';
import { MS_PER_DAY } from '../product.constants';

export const daysAgo = (days: number): string =>
  new Date(Date.now() - days * MS_PER_DAY).toISOString();

export const makeProduct = (overrides: Partial<Product> = {}): Product => ({
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
  occasions: [],
  _count: { reviews: 0, cartItems: 0, wishlistItems: 0, orderItems: 0 },
  ...overrides,
});

export const makeProductsResponse = (products: Product[] = []): ProductsResponse => ({
  status: true,
  code: 200,
  payload: {
    data: products,
    metadata: { page: 1, limit: 10, total: products.length, totalPages: 1 },
  },
});

export const makeOccasion = (overrides: Partial<Occasion> = {}): Occasion => ({
  id: 'occasion-1',
  title: 'Wedding',
  description: 'Wedding bouquets and arrangements',
  image: null,
  immutable: false,
  createdAt: daysAgo(365),
  updatedAt: daysAgo(365),
  ...overrides,
});

export const makeOccasionsResponse = (occasions: Occasion[] = []): OccasionsResponse => ({
  status: true,
  code: 200,
  payload: {
    data: occasions,
    metadata: { page: 1, limit: 20, total: occasions.length, totalPages: 1 },
  },
});
