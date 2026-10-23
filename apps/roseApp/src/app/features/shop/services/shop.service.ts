import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import ShopEndPoint from '../enums/EndPoints';
import ShopApi from '../base/shopApi';
import { ProductsQuery } from '../interfaces/home.model/home-model-request';
import { OccasionsResponse,ProductResponse,ProductsResponse} from '../interfaces/home.model/home-model-response';
import { CreateReviewRequest, ReviewsQuery } from '../interfaces/review.model/review-request';
import { CreateReviewResponse, ReviewsResponse } from '../interfaces/review.model/review-response';

@Injectable({
  providedIn: 'root',
})
export class ShopService implements ShopApi {
  private readonly _httpClient = inject(HttpClient);

  getProducts(query: ProductsQuery = {}): Observable<ProductsResponse> {
    return this._httpClient.get<ProductsResponse>(ShopEndPoint.PRODUCTS, {
      params: this.buildParams(query),
    });
  }

  getProduct(id: string): Observable<ProductResponse> {
    return this._httpClient.get<ProductResponse>(`${ShopEndPoint.PRODUCTS}/${id}`);
  }

  getOccasions(): Observable<OccasionsResponse> {
    return this._httpClient.get<OccasionsResponse>(ShopEndPoint.OCCASIONS);
  }

  getReviews(query: ReviewsQuery = {}): Observable<ReviewsResponse> {
    return this._httpClient.get<ReviewsResponse>(ShopEndPoint.REVIEWS, {
      params: this.buildParams(query),
    });
  }

  addReview(body: CreateReviewRequest): Observable<CreateReviewResponse> {
    return this._httpClient.post<CreateReviewResponse>(ShopEndPoint.REVIEWS, body);
  }

  private buildParams(query: ProductsQuery | ReviewsQuery): HttpParams {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }
}
