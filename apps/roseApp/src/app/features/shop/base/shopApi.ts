import { HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageQuery, ProductsQuery } from '../interfaces/home.model/home-model-request';
import {
  CategoriesResponse,
  OccasionsResponse,
  ProductResponse,
  ProductsResponse,
} from '../interfaces/home.model/home-model-response';
import {
  CreateReviewRequest,
  ReviewsQuery,
} from '../interfaces/review.model/review-request';
import {
  CreateReviewResponse,
  ReviewsResponse,
} from '../interfaces/review.model/review-response';
import { TestimonialsResponse } from '../interfaces/home.Testimonial/Testimonial';
import { AddToWishlistRequest } from '../interfaces/wishlist.model/wishlist-request';
import {
  WishlistMessageResponse,
  WishlistResponse,
} from '../interfaces/wishlist.model/wishlist-response';

export default abstract class ShopApi {
  abstract getProducts(query?: ProductsQuery, context?: HttpContext): Observable<ProductsResponse>;
  abstract getProduct(id: string): Observable<ProductResponse>;
  abstract getCategories(query?: PageQuery): Observable<CategoriesResponse>;
  abstract getOccasions(query?: PageQuery): Observable<OccasionsResponse>;
  abstract getReviews(query?: ReviewsQuery): Observable<ReviewsResponse>;
  abstract addReview(
    body: CreateReviewRequest,
  ): Observable<CreateReviewResponse>;
  abstract getTestimonials(): Observable<TestimonialsResponse>;
  abstract getWishlist(): Observable<WishlistResponse>;
  abstract addToWishlist(
    body: AddToWishlistRequest,
  ): Observable<WishlistMessageResponse>;
  abstract removeFromWishlist(
    productId: string,
  ): Observable<WishlistMessageResponse>;
  abstract clearWishlist(): Observable<WishlistMessageResponse>;
}
