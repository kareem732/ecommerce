import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, switchMap, tap } from 'rxjs';
import { REVIEWS_PAGE_SIZE } from '../../components/product-reviews/product-reviews.constants';
import { ShopService } from '../../services/shop.service';
import { initialState } from './reviews.state';

export const ReviewsStore = signalStore(
  withState(initialState),

  withComputed(({ reviews, total, status }) => ({
    hasMore: computed(() => reviews().length < total()),
    firstLoad: computed(() => status() === 'loading' && !reviews().length),
  })),

  withMethods((store, api = inject(ShopService)) => {
    const fetchPage = (productId: string, page: number) => {
      patchState(store, { page, status: 'loading' });
      return api.getReviews({ productId, page, limit: REVIEWS_PAGE_SIZE }).pipe(
        tap(({ payload }) =>
          patchState(store, (s) => ({
            reviews: page === 1 ? payload.data : [...s.reviews, ...payload.data],
            total: payload.metadata.total,
            status: 'loaded' as const,
          })),
        ),
        catchError(() => {
          patchState(store, { status: 'error' });
          return EMPTY;
        }),
      );
    };

    const fetchSummary = (productId: string) =>
      api.getProduct(productId).pipe(
        tap(({ payload: { product } }) =>
          patchState(store, { summary: { rating: product.rating, count: product.ratings } }),
        ),
        catchError(() => {
          patchState(store, { summary: null });
          return EMPTY;
        }),
      );

    const loadPage = rxMethod<{ productId: string; page: number }>(
      switchMap(({ productId, page }) => fetchPage(productId, page)),
    );
    const loadSummary = rxMethod<string>(switchMap((productId) => fetchSummary(productId)));

    const reloadPage = (page: number) => {
      const productId = store.productId();
      if (!productId) return;
      loadPage({ productId, page });
      loadSummary(productId);
    };

    return {
      loadProduct: rxMethod<string>(
        tap((productId) => {
          patchState(store, { ...initialState, productId });
          loadPage({ productId, page: 1 });
          loadSummary(productId);
        }),
      ),

      loadMore(): void {
        const productId = store.productId();
        if (!productId || store.status() === 'loading') return;
        loadPage({ productId, page: store.page() + 1 });
      },
      retry(): void {
        reloadPage(store.page());
      },

      refresh(): void {
        reloadPage(1);
      },
    };
  }),
);
