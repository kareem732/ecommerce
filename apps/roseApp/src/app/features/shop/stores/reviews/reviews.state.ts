import { Review } from '../../interfaces/review.model/review-response';
import { LoadStatus, RatingSummary } from './reviews.models';

export type ReviewsState = {
  productId: string | null;
  reviews: Review[];
  total: number;
  page: number;
  status: LoadStatus;
  summary: RatingSummary | null;
};

export const initialState: ReviewsState = {
  productId: null,
  reviews: [],
  total: 0,
  page: 1,
  status: 'loading',
  summary: null,
};
