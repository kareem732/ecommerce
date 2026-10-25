export interface ReviewsQuery {
  productId?: string;
  page?: number;
  limit?: number;
}

export interface CreateReviewRequest {
  productId: string;
  headline: string;
  content?: string;
  rating: number;
}
