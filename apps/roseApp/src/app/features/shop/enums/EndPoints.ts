import { environment } from '../../../../environments/environment';

export default class ShopEndPoint {
  static readonly PRODUCTS = `${environment.apiUrl}/api/products`;
  static readonly OCCASIONS = `${environment.apiUrl}/api/occasions`;
  static readonly REVIEWS = `${environment.apiUrl}/api/reviews`;
}
