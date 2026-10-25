import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { MOST_POPULAR_LIMIT } from '../../components/most-popular/most-popular.constants';
import { ProductSortBy, SortOrder } from '../../enums/product-sort';
import { ShopService } from '../../services/shop.service';
import { initialState } from './home.state';

const BEST_SELLING_LIMIT = 10;

export const HomeStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withMethods((store, api = inject(ShopService)) => ({
    selectOccasion(id: string | null): void {
      patchState(store, { selectedOccasionId: id });
    },

    loadBestSelling: rxMethod<void>(
      switchMap(() =>
        api
          .getProducts({
            page: 1,
            limit: BEST_SELLING_LIMIT,
            sortBy: ProductSortBy.BEST_SELLING,
            sortOrder: SortOrder.DESC,
          })
          .pipe(
            tap(({ payload }) => patchState(store, { bestSelling: payload.data })),
            catchError(() => EMPTY),
          ),
      ),
    ),

    loadOccasions: rxMethod<void>(
      switchMap(() =>
        api.getOccasions().pipe(
          tap(({ payload }) => patchState(store, { occasions: payload.data })),
          catchError(() => EMPTY),
        ),
      ),
    ),

    loadTestimonials: rxMethod<void>(
      switchMap(() =>
        api.getTestimonials().pipe(
          tap(({ payload }) => patchState(store, { testimonials: payload.data })),
          catchError(() => EMPTY),
        ),
      ),
    ),

    loadPopular: rxMethod<string | null>(
      pipe(
        tap(() => patchState(store, { popularLoading: true })),
        switchMap((occasionId) =>
          api
            .getProducts({
              page: 1,
              limit: MOST_POPULAR_LIMIT,
              sortBy: ProductSortBy.MOST_POPULAR,
              sortOrder: SortOrder.DESC,
              ...(occasionId ? { occasionId } : {}),
            })
            .pipe(
              tap(({ payload }) =>
                patchState(store, { popular: payload.data, popularLoading: false }),
              ),
              catchError(() => {
                patchState(store, { popular: [], popularLoading: false });
                return EMPTY;
              }),
            ),
        ),
      ),
    ),
  })),

  withHooks({
    onInit(store) {
      store.loadBestSelling();
      store.loadOccasions();
      store.loadTestimonials();
      store.loadPopular(store.selectedOccasionId);
    },
  }),
);
