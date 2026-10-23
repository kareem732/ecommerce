import { Review, ReviewsResponse } from '../../../features/shop/interfaces/review.model/review-response';

export const makeReview = (overrides: Partial<Review> = {}): Review => ({
  id: 'review-1',
  userId: 'user-1',
  productId: 'product-1',
  headline: 'Awesome Bouquet!',
  content: 'Fresh and beautifully arranged.',
  rating: 5,
  createdAt: '2025-04-07T10:00:00.000Z',
  updatedAt: '2025-04-07T10:00:00.000Z',
  user: { id: 'user-1', username: 'adrian', firstName: 'Adrian', lastName: 'Smith' },
  product: { id: 'product-1', title: 'Test Product' },
  ...overrides,
});

export const makeReviewsResponse = (
  reviews: Review[] = [],
  { page = 1, total = reviews.length }: { page?: number; total?: number } = {},
): ReviewsResponse => ({
  status: true,
  code: 200,
  payload: {
    data: reviews,
    metadata: { page, limit: reviews.length, total, totalPages: 1 },
  },
});
