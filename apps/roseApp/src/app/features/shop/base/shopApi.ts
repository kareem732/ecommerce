import { HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AddressRequest,
  UpdateAddressRequest,
} from '../interfaces/address.model/address-request';
import {
  AddressMessageResponse,
  AddressResponse,
  AddressesResponse,
} from '../interfaces/address.model/address-response';
import {
  AddToCartRequest,
  AddToCartResponse,
  CartMessageResponse,
  CartResponse,
  UpdateCartRequest,
  UpdateCartResponse,
} from '../interfaces/cart.model/cart.model';
import { PageQuery, ProductsQuery } from '../interfaces/home.model/home-model-request';
import {
  CategoriesResponse,
  OccasionsResponse,
  ProductResponse,
  ProductsResponse,
} from '../interfaces/home.model/home-model-response';
import { CreateTestimonialRequest, TestimonialsResponse } from '../interfaces/home.Testimonial/Testimonial';
import { CreateReviewRequest, ReviewsQuery } from '../interfaces/review.model/review-request';
import {
  CreateReviewResponse,
  ReviewsResponse,
} from '../interfaces/review.model/review-response';
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
  abstract getTestimonials(): Observable<TestimonialsResponse>;
  abstract addTestimonial(body: CreateTestimonialRequest): Observable<unknown>;

  abstract getReviews(query?: ReviewsQuery): Observable<ReviewsResponse>;
  abstract addReview(body: CreateReviewRequest): Observable<CreateReviewResponse>;

  abstract getWishlist(): Observable<WishlistResponse>;
  abstract addToWishlist(body: AddToWishlistRequest): Observable<WishlistMessageResponse>;
  abstract removeFromWishlist(wishlistItemId: string): Observable<WishlistMessageResponse>;
  abstract clearWishlist(): Observable<WishlistMessageResponse>;

  abstract getCart(): Observable<CartResponse>;
  abstract addToCart(body: AddToCartRequest): Observable<AddToCartResponse>;
  abstract updateItemQuantity(
    cartItemId: string,
    body: UpdateCartRequest,
  ): Observable<UpdateCartResponse>;
  abstract removeItemFromCart(cartItemId: string): Observable<CartMessageResponse>;
  abstract clearCart(): Observable<CartMessageResponse>;

  abstract getAddresses(): Observable<AddressesResponse>;
  abstract getAddress(addressId: string): Observable<AddressResponse>;
  abstract addAddress(body: AddressRequest): Observable<AddressResponse>;
  abstract updateAddress(
    addressId: string,
    body: UpdateAddressRequest,
  ): Observable<AddressResponse>;
  abstract deleteAddress(addressId: string): Observable<AddressMessageResponse>;
}
