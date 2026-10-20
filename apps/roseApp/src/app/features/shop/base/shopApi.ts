import { Observable } from 'rxjs';
import { ProductsQuery } from '../interfaces/home.model/home-model-request';
import { OccasionsResponse,ProductsResponse} from '../interfaces/home.model/home-model-response';

export default abstract class ShopApi {
  abstract getProducts(query?: ProductsQuery): Observable<ProductsResponse>;
  abstract getOccasions(): Observable<OccasionsResponse>;
}
