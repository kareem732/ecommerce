import { ApiResponse, PaginatedPayload } from '../home.model/home-model-response';

export interface ReviewUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface ReviewProduct {
  id: string;
  title: string;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  headline: string;
  content: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  user: ReviewUser;
  product: ReviewProduct;
}

export type ReviewsResponse = ApiResponse<PaginatedPayload<Review>>;
export type CreateReviewResponse = ApiResponse<unknown>;
