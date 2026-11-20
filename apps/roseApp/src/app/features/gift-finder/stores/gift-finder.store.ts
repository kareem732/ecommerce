import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, Observable, catchError, forkJoin, map, of, pipe, switchMap, tap } from 'rxjs';
import { skipLoading } from '../../../core/interceptors/loading.interceptor';
import { ProductsQuery } from '../../shop/interfaces/home.model/home-model-request';
import { Category, Occasion } from '../../shop/interfaces/home.model/home-model-response';
import { ProductCatalogService } from '../../shop/services/product-catalog.service';
import { ShopService } from '../../shop/services/shop.service';
import { EMPTY_GIFT_ANSWERS, GIFT_MIN_RESULTS } from '../constants/gift-finder.constants';
import { GIFT_FINDER_QUESTIONS, GiftFinderStep } from '../enums/gift-finder-step.enum';
import { GiftAnswers, GiftMatch, GiftSearchResult } from '../interfaces/gift-finder.models';
import { buildQueryAttempts, rankGifts } from '../utils/gift-finder.utils';

type SearchStatus = 'idle' | 'searching' | 'done' | 'error';

interface GiftFinderState {
  step: GiftFinderStep;
  answers: GiftAnswers;
  occasions: Occasion[];
  categories: Category[];
  matches: GiftMatch[];
  relaxed: boolean;
  status: SearchStatus;
}

const initialState: GiftFinderState = {
  step: GIFT_FINDER_QUESTIONS[0],
  answers: EMPTY_GIFT_ANSWERS,
  occasions: [],
  categories: [],
  matches: [],
  relaxed: false,
  status: 'idle',
};

export const GiftFinderStore = signalStore(
  withState(initialState),
  withComputed(({ step }) => ({
    stepIndex: computed(() => GIFT_FINDER_QUESTIONS.indexOf(step())),
    isResults: computed(() => step() === GiftFinderStep.Results),
  })),
  withMethods(
    (store, shop = inject(ShopService), catalog = inject(ProductCatalogService)) => {
      /** Tries each query until one returns enough products; keeps the last as a fallback. */
      const search = (attempts: ProductsQuery[], index = 0): Observable<GiftSearchResult> =>
        shop.getProducts(attempts[index], skipLoading()).pipe(
          switchMap(({ payload }) => {
            const isLast = index === attempts.length - 1;
            if (payload.data.length >= GIFT_MIN_RESULTS || isLast) {
              return of({ matches: rankGifts(payload.data, store.answers()), relaxed: index > 0 });
            }
            return search(attempts, index + 1);
          }),
        );

      const findGifts = rxMethod<GiftAnswers>(
        pipe(
          tap(() => patchState(store, { status: 'searching', matches: [], relaxed: false })),
          switchMap((answers) =>
            search(buildQueryAttempts(answers)).pipe(
              tap(({ matches, relaxed }) => patchState(store, { matches, relaxed, status: 'done' })),
              catchError(() => {
                patchState(store, { status: 'error' });
                return EMPTY;
              }),
            ),
          ),
        ),
      );

      const goTo = (step: GiftFinderStep): void => {
        patchState(store, { step });
        if (step === GiftFinderStep.Results) findGifts(store.answers());
      };

      const next = (): void => {
        const nextStep = GIFT_FINDER_QUESTIONS[store.stepIndex() + 1] ?? GiftFinderStep.Results;
        goTo(nextStep);
      };

      const answer = (changes: Partial<GiftAnswers>): void => {
        patchState(store, { answers: { ...store.answers(), ...changes } });
        next();
      };

      return {
        loadOptions: rxMethod<void>(
          pipe(
            switchMap(() =>
              forkJoin({
                occasions: catalog.loadOccasions(skipLoading()),
                categories: catalog.loadCategories(skipLoading()),
              }).pipe(
                map((options) => patchState(store, options)),
                catchError(() => EMPTY),
              ),
            ),
          ),
        ),
        answer,
        back(): void {
          const index = store.isResults() ? GIFT_FINDER_QUESTIONS.length : store.stepIndex();
          if (index > 0) patchState(store, { step: GIFT_FINDER_QUESTIONS[index - 1] });
        },
        retry(): void {
          findGifts(store.answers());
        },
        restart(): void {
          patchState(store, {
            step: GIFT_FINDER_QUESTIONS[0],
            answers: EMPTY_GIFT_ANSWERS,
            matches: [],
            relaxed: false,
            status: 'idle',
          });
        },
      };
    },
  ),
  withHooks({
    onInit(store) {
      store.loadOptions();
    },
  }),
);
