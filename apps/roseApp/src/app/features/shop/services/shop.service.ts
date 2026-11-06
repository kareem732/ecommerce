// import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
// import { inject, Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import ShopApi from '../base/shopApi';
// import ShopEndPoint from '../enums/EndPoints';
// import { PageQuery, ProductsQuery } from '../interfaces/home.model/home-model-request';
// import {
//   CategoriesResponse,
//   OccasionsResponse,
//   ProductResponse,
//   ProductsResponse,
// } from '../interfaces/home.model/home-model-response';
// import { TestimonialsResponse } from '../interfaces/home.Testimonial/Testimonial';
// import {
//   CreateReviewRequest,
//   ReviewsQuery,
// } from '../interfaces/review.model/review-request';
// import {
//   CreateReviewResponse,
//   ReviewsResponse,
// } from '../interfaces/review.model/review-response';
// import { AddToWishlistRequest } from '../interfaces/wishlist.model/wishlist-request';
// import {
//   WishlistMessageResponse,
//   WishlistResponse,
// } from '../interfaces/wishlist.model/wishlist-response';

// @Injectable({
//   providedIn: 'root',
// })
// export class ShopService implements ShopApi {
//   private readonly _httpClient = inject(HttpClient);

//   getProducts(
//     query: ProductsQuery = {},
//     context?: HttpContext,
//   ): Observable<ProductsResponse> {
//     return this._httpClient.get<ProductsResponse>(ShopEndPoint.PRODUCTS, {
//       context,
//       params: this.buildParams({
//         ...query,
//         ...(query.search !== undefined
//           ? { search: query.search.trim().slice(0, 200) }
//           : {}),
//       }),
//     });
//   }

//   getProduct(id: string): Observable<ProductResponse> {
//     return this._httpClient.get<ProductResponse>(
//       `${ShopEndPoint.PRODUCTS}/${id}`,
//     );
//   }

//   getCategories(query: PageQuery = {}): Observable<CategoriesResponse> {
//     return this._httpClient.get<CategoriesResponse>(ShopEndPoint.CATEGORIES, {
//       params: this.buildParams(query),
//     });
//   }

//   getOccasions(query: PageQuery = {}): Observable<OccasionsResponse> {
//     return this._httpClient.get<OccasionsResponse>(ShopEndPoint.OCCASIONS, {
//       params: this.buildParams(query),
//     });
//   }

//   getReviews(query: ReviewsQuery = {}): Observable<ReviewsResponse> {
//     return this._httpClient.get<ReviewsResponse>(ShopEndPoint.REVIEWS, {
//       params: this.buildParams(query),
//     });
//   }

//   addReview(body: CreateReviewRequest): Observable<CreateReviewResponse> {
//     return this._httpClient.post<CreateReviewResponse>(
//       ShopEndPoint.REVIEWS,
//       body,
//     );
//   }

//   getTestimonials(): Observable<TestimonialsResponse> {
//     return this._httpClient.get<TestimonialsResponse>(
//       ShopEndPoint.TESTIMONIALS,
//     );
//   }

//   getWishlist(): Observable<WishlistResponse> {
//     return this._httpClient.get<WishlistResponse>(ShopEndPoint.WISHLIST);
//   }

//   addToWishlist(
//     body: AddToWishlistRequest,
//   ): Observable<WishlistMessageResponse> {
//     return this._httpClient.post<WishlistMessageResponse>(
//       ShopEndPoint.WISHLIST,
//       body,
//     );
//   }

//   removeFromWishlist(
//     wishlistItemId: string,
//   ): Observable<WishlistMessageResponse> {
//     return this._httpClient.delete<WishlistMessageResponse>(
//       `${ShopEndPoint.WISHLIST}/${wishlistItemId}`,
//     );
//   }

//   clearWishlist(): Observable<WishlistMessageResponse> {
//     return this._httpClient.delete<WishlistMessageResponse>(
//       ShopEndPoint.WISHLIST,
//     );
//   }

//   private buildParams(query: ProductsQuery | ReviewsQuery | PageQuery): HttpParams {
//     let params = new HttpParams();
//     Object.entries(query).forEach(([key, value]) => {
//       if (value !== undefined && value !== null && value !== '') {
//         params = params.set(key, String(value));
//       }
//     });
//     return params;
//   }
// }
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import ShopApi from '../base/shopApi';
import ShopEndPoint from '../enums/EndPoints';
import { PageQuery, ProductsQuery } from '../interfaces/home.model/home-model-request';
import {
  CategoriesResponse,
  OccasionsResponse,
  ProductResponse,
  ProductsResponse,
} from '../interfaces/home.model/home-model-response';
import { TestimonialsResponse } from '../interfaces/home.Testimonial/Testimonial';
import {
  CreateReviewRequest,
  ReviewsQuery,
} from '../interfaces/review.model/review-request';
import {
  CreateReviewResponse,
  ReviewsResponse,
} from '../interfaces/review.model/review-response';
import { AddToWishlistRequest } from '../interfaces/wishlist.model/wishlist-request';
import {
  WishlistMessageResponse,
  WishlistResponse,
} from '../interfaces/wishlist.model/wishlist-response';
import {
  AddToCartRequest,
  AddToCartResponse,
  CartMessageResponse,
  CartResponse,
  UpdateCartRequest,
  UpdateCartResponse,
} from '../interfaces/cart.model/cart.model';

@Injectable({
  providedIn: 'root',
})
export class ShopService implements ShopApi {
  private readonly _httpClient = inject(HttpClient);

  getProducts(
    query: ProductsQuery = {},
    context?: HttpContext,
  ): Observable<ProductsResponse> {
    return this._httpClient.get<ProductsResponse>(ShopEndPoint.PRODUCTS, {
      context,
      params: this.buildParams({
        ...query,
        ...(query.search !== undefined
          ? { search: query.search.trim().slice(0, 200) }
          : {}),
      }),
    });
  }

  getProduct(id: string): Observable<ProductResponse> {
    return this._httpClient.get<ProductResponse>(
      `${ShopEndPoint.PRODUCTS}/${id}`,
    );
  }

  getCategories(query: PageQuery = {}): Observable<CategoriesResponse> {
    return this._httpClient.get<CategoriesResponse>(ShopEndPoint.CATEGORIES, {
      params: this.buildParams(query),
    });
  }

  getOccasions(query: PageQuery = {}): Observable<OccasionsResponse> {
    return this._httpClient.get<OccasionsResponse>(ShopEndPoint.OCCASIONS, {
      params: this.buildParams(query),
    });
  }

  getReviews(query: ReviewsQuery = {}): Observable<ReviewsResponse> {
    return this._httpClient.get<ReviewsResponse>(ShopEndPoint.REVIEWS, {
      params: this.buildParams(query),
    });
  }

  addReview(body: CreateReviewRequest): Observable<CreateReviewResponse> {
    return this._httpClient.post<CreateReviewResponse>(
      ShopEndPoint.REVIEWS,
      body,
    );
  }

  getTestimonials(): Observable<TestimonialsResponse> {
    return this._httpClient.get<TestimonialsResponse>(
      ShopEndPoint.TESTIMONIALS,
    );
  }

  getWishlist(): Observable<WishlistResponse> {
    return this._httpClient.get<WishlistResponse>(ShopEndPoint.WISHLIST);
  }

  addToWishlist(
    body: AddToWishlistRequest,
  ): Observable<WishlistMessageResponse> {
    return this._httpClient.post<WishlistMessageResponse>(
      ShopEndPoint.WISHLIST,
      body,
    );
  }

  removeFromWishlist(
    wishlistItemId: string,
  ): Observable<WishlistMessageResponse> {
    return this._httpClient.delete<WishlistMessageResponse>(
      `${ShopEndPoint.WISHLIST}/${wishlistItemId}`,
    );
  }

  clearWishlist(): Observable<WishlistMessageResponse> {
    return this._httpClient.delete<WishlistMessageResponse>(
      ShopEndPoint.WISHLIST,
    );
  }

  getCart(): Observable<CartResponse> {
    return this._httpClient.get<CartResponse>(ShopEndPoint.CART);
  }

  addToCart(body: AddToCartRequest): Observable<AddToCartResponse> {
    return this._httpClient.post<AddToCartResponse>(ShopEndPoint.CART, body);
  }

  updateItemQuantity(
    cartItemId: string,
    body: UpdateCartRequest,
  ): Observable<UpdateCartResponse> {
    return this._httpClient.patch<UpdateCartResponse>(
      `${ShopEndPoint.CART}/${cartItemId}`,
      body,
    );
  }

  removeItemFromCart(cartItemId: string): Observable<CartMessageResponse> {
    return this._httpClient.delete<CartMessageResponse>(
      `${ShopEndPoint.CART}/${cartItemId}`,
    );
  }

  clearCart(): Observable<CartMessageResponse> {
    return this._httpClient.delete<CartMessageResponse>(ShopEndPoint.CART);
  }

  private buildParams(query: ProductsQuery | ReviewsQuery | PageQuery): HttpParams {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }
}
