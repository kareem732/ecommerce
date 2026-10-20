import { Observable } from 'rxjs';
import { ProductsQuery } from '../interfaces/home.model/home-model-request';
import { ProductsResponse } from '../interfaces/home.model/home-model-response';

export default abstract class ShopApi {
  abstract getProducts(query?: ProductsQuery): Observable<ProductsResponse>;
  
}
