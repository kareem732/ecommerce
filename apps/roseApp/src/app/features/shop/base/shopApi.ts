import { Observable } from 'rxjs';
import { ProductsQuery } from '../interfaces/home.model/home-model-request';
import { OccasionsResponse,ProductResponse,ProductsResponse} from '../interfaces/home.model/home-model-response';
import { CreateReviewRequest, ReviewsQuery } from '../interfaces/review.model/review-request';
import { CreateReviewResponse, ReviewsResponse } from '../interfaces/review.model/review-response';
import { TestimonialsResponse } from '../interfaces/home.Testimonial/Testimonial';

export default abstract class ShopApi {
  abstract getProducts(query?: ProductsQuery): Observable<ProductsResponse>;
  abstract getProduct(id: string): Observable<ProductResponse>;
  abstract getOccasions(): Observable<OccasionsResponse>;
  abstract getReviews(query?: ReviewsQuery): Observable<ReviewsResponse>;
  abstract addReview(body: CreateReviewRequest): Observable<CreateReviewResponse>;
  abstract getTestimonials(): Observable<TestimonialsResponse>;
}
