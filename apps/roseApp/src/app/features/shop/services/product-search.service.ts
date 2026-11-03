import { inject, Injectable } from '@angular/core';
import {
  catchError,
  combineLatest,
  debounce,
  distinctUntilChanged,
  forkJoin,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  switchMap,
  timer,
} from 'rxjs';
import { skipLoading } from '../../../core/interceptors/loading.interceptor';
import { normalizeSearchTerm } from '../../../shared/utils/text-search';
import { Product } from '../interfaces/home.model/home-model-response';
import { ShopService } from './shop.service';
import {
  SEARCH_CATALOG_PAGE_SIZE,
  SEARCH_DEBOUNCE_MS,
  SEARCH_RESULTS_LIMIT,
  SEARCH_SUGGESTIONS_LIMIT,
} from './product-search.constants';

export interface ProductSearchState {
  term: string;
  products: Product[];
  loading: boolean;
}

export const INITIAL_PRODUCT_SEARCH_STATE: ProductSearchState = {
  term: '',
  products: [],
  loading: true,
};

interface SearchIndex {
  entries: { product: Product; key: string }[];
  suggestions: Product[];
}

const EMPTY_INDEX: SearchIndex = { entries: [], suggestions: [] };

/**
 * Frontend-only product search: the catalog is fetched once (lazily, on first
 * subscription) and cached, then every keystroke is filtered in memory.
 */
@Injectable({ providedIn: 'root' })
export class ProductSearchService {
  private readonly shop = inject(ShopService);

  private readonly index$: Observable<SearchIndex> = this.loadCatalog().pipe(
    map(buildIndex),
    // shareReplay resets on error, so a failed load is retried on the next open.
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  search(query$: Observable<string>): Observable<ProductSearchState> {
    const term$ = query$.pipe(
      map(normalizeSearchTerm),
      // Typing is debounced; clearing the box should feel instant.
      debounce((term) => (term ? timer(SEARCH_DEBOUNCE_MS) : of(term))),
      distinctUntilChanged(),
    );

    return combineLatest([this.index$.pipe(catchError(() => of(EMPTY_INDEX))), term$]).pipe(
      map(([index, term]) => ({
        term,
        products: term ? matchProducts(index, term) : index.suggestions,
        loading: false,
      })),
      startWith(INITIAL_PRODUCT_SEARCH_STATE),
    );
  }

  private loadCatalog(): Observable<Product[]> {
    const context = skipLoading();
    const fetchPage = (page: number) =>
      this.shop
        .getProducts({ page, limit: SEARCH_CATALOG_PAGE_SIZE }, context)
        .pipe(map(({ payload }) => payload));

    return fetchPage(1).pipe(
      switchMap(({ data, metadata }) => {
        if (metadata.totalPages <= 1) return of(data);
        const rest = Array.from({ length: metadata.totalPages - 1 }, (_, i) => fetchPage(i + 2));
        return forkJoin(rest).pipe(map((pages) => data.concat(...pages.map((p) => p.data))));
      }),
    );
  }
}

function buildIndex(products: Product[]): SearchIndex {
  return {
    entries: products.map((product) => ({ product, key: normalizeSearchTerm(product.title) })),
    suggestions: [...products]
      .sort((a, b) => b.rating - a.rating || b.ratings - a.ratings)
      .slice(0, SEARCH_SUGGESTIONS_LIMIT),
  };
}

function matchProducts({ entries }: SearchIndex, term: string): Product[] {
  const matches: Product[] = [];
  for (const { product, key } of entries) {
    if (!key.includes(term)) continue;
    matches.push(product);
    if (matches.length === SEARCH_RESULTS_LIMIT) break;
  }
  return matches;
}
