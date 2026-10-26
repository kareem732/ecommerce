import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ProductResponse,
  ProductsResponse,
} from '../../shop/interfaces/home.model/home-model-response';
import { ProductsQuery } from '../../shop/interfaces/home.model/home-model-request';
import { ReviewsQuery } from '../../shop/interfaces/review.model/review-request';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly _httpClient = inject(HttpClient);
  private readonly _baseUrl = environment.apiUrl;

  getProducts(query: ProductsQuery = {}): Observable<ProductsResponse> {
    return this._httpClient.get<ProductsResponse>(
      `${this._baseUrl}/api/products`,
      {
        params: this.buildParams(query),
      },
    );
  }

  getProduct(id: string): Observable<ProductResponse> {
    return this._httpClient.get<ProductResponse>(
      `${this._baseUrl}/api/products/${id}`,
    );
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
