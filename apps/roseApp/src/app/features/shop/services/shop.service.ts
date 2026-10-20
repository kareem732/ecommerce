import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import ShopEndPoint from '../enums/EndPoints';
import ShopApi from '../base/shopApi';
import { ProductsQuery } from '../interfaces/home.model/home-model-request';
import { OccasionsResponse,ProductsResponse} from '../interfaces/home.model/home-model-response';

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

  getOccasions(): Observable<OccasionsResponse> {
    return this._httpClient.get<OccasionsResponse>(ShopEndPoint.OCCASIONS);
  }

  private buildParams(query: ProductsQuery): HttpParams {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }
}
