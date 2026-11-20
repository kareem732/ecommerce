import { Signal, WritableSignal, computed, linkedSignal, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, catchError, map, of, startWith, switchMap } from 'rxjs';
import { PageQuery } from '../interfaces/home.model/home-model-request';
import { ApiResponse, PaginatedPayload } from '../interfaces/home.model/home-model-response';

export const COLLECTION_PAGE_SIZE = 12;

export interface PagedCollection<T> {
  page: WritableSignal<number>;
  pageSize: number;
  /** `null` while the current page is loading. */
  items: Signal<T[] | null>;
  total: Signal<number>;
}

type PageFetcher<T> = (query: PageQuery) => Observable<ApiResponse<PaginatedPayload<T>>>;

const EMPTY_PAGE = { data: [], metadata: { page: 1, limit: 0, total: 0, totalPages: 0 } };

/** Server-side paginated list driven by a `page` signal. Must run in an injection context. */
export function pagedCollection<T>(
  fetch: PageFetcher<T>,
  pageSize = COLLECTION_PAGE_SIZE,
): PagedCollection<T> {
  const page = signal(1);

  const result = toSignal(
    toObservable(page).pipe(
      switchMap((current) =>
        fetch({ page: current, limit: pageSize }).pipe(
          map(({ payload }) => payload),
          catchError(() => of<PaginatedPayload<T>>(EMPTY_PAGE)),
          startWith(null),
        ),
      ),
    ),
    { initialValue: null },
  );

  return {
    page,
    pageSize,
    items: computed(() => result()?.data ?? null),
    // Keep the previous total while a page loads so the paginator doesn't disappear.
    total: linkedSignal<PaginatedPayload<T> | null, number>({
      source: result,
      computation: (payload, previous) => payload?.metadata.total ?? previous?.value ?? 0,
    }),
  };
}
