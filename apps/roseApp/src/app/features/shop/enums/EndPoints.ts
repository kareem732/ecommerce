import { environment } from '../../../../environments/environment';

export default class ShopEndPoint {
  static readonly PRODUCTS = `${environment.apiUrl}/api/products`;
  static readonly CATEGORIES = `${environment.apiUrl}/api/categories`;
  static readonly OCCASIONS = `${environment.apiUrl}/api/occasions`;
  static readonly REVIEWS = `${environment.apiUrl}/api/reviews`;
  static readonly TESTIMONIALS = `${environment.apiUrl}/api/testimonials`;
  static readonly CART = `${environment.apiUrl}/api/cart`;
  static readonly WISHLIST = `${environment.apiUrl}/api/wishlist`;
  static readonly ADDRESSES = `${environment.apiUrl}/api/addresses`;
  static readonly ORDERS = `${environment.apiUrl}/api/orders`;
  static readonly PAYMENTS_CHECKOUT_SESSION = `${environment.apiUrl}/api/payments/checkout-session`;
}
