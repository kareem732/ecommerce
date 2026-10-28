import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, filter, pipe, switchMap, tap } from 'rxjs';
import { GalleryItem } from '../../interfaces/product-details.model/product-details.model';
import { ShopService } from '../../services/shop.service';
import { initialState } from './product-details.state';
import { parseGallery } from '../../../../shared/utils/parse-gallery';

const MAX_THUMBS = 7;

export const ProductDetailsStore = signalStore(
  withState(initialState),

  withComputed(({ product }) => {
    const images = computed(() => {
      const p = product();
      return p ? parseGallery(p.cover, p.gallery) : [];
    });

    return {
      images,
      galleryItems: computed<GalleryItem[]>(() =>
        images().map((url, index) => ({ url, index })),
      ),
      thumbNumVisible: computed(() => Math.max(1, Math.min(images().length, MAX_THUMBS))),
    };
  }),

  withMethods((store, api = inject(ShopService)) => {
    const load = rxMethod<string | null>(
      pipe(
        tap((id) =>
          patchState(
            store,
            id
              ? { productId: id, product: null, status: 'loading', activeIndex: 0, thumbPage: 0 }
              : { productId: null, product: null, status: 'missing-id' },
          ),
        ),
        filter((id): id is string => !!id),
        switchMap((id) =>
          api.getProduct(id).pipe(
            tap(({ payload }) =>
              patchState(
                store,
                payload?.product
                  ? { product: payload.product, status: 'success' }
                  : { product: null, status: 'not-found' },
              ),
            ),
            catchError((err: HttpErrorResponse) => {
              patchState(store, {
                product: null,
                status: err.status === 404 ? 'not-found' : 'error',
              });
              return EMPTY;
            }),
          ),
        ),
      ),
    );

    return {
      load,

      retry(): void {
        const id = store.productId();
        if (id) load(id);
      },

      selectImage(index: number): void {
        if (index >= 0 && index < store.images().length) {
          patchState(store, { activeIndex: index });
        }
      },

      setThumbPage(page: number): void {
        patchState(store, { thumbPage: page });
      },
    };
  }),
);
