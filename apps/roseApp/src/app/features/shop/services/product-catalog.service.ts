import { HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import {
  ApiResponse,
  Category,
  Occasion,
  PaginatedPayload,
  Product,
} from '../interfaces/home.model/home-model-response';
import { SEARCH_CATALOG_PAGE_SIZE } from './product-search.constants';
import { ShopService } from './shop.service';

type PageRequest<T> = (page: number, limit: number) => Observable<ApiResponse<PaginatedPayload<T>>>;

/** Loads whole collections (products, categories, occasions) by walking every page. */
@Injectable({ providedIn: 'root' })
export class ProductCatalogService {
  private readonly shop = inject(ShopService);

  loadAll(context?: HttpContext): Observable<Product[]> {
    return loadAllPages((page, limit) => this.shop.getProducts({ page, limit }, context));
  }

  loadCategories(): Observable<Category[]> {
    return loadAllPages((page, limit) => this.shop.getCategories({ page, limit }));
  }

  loadOccasions(): Observable<Occasion[]> {
    return loadAllPages((page, limit) => this.shop.getOccasions({ page, limit }));
  }
}

function loadAllPages<T>(request: PageRequest<T>): Observable<T[]> {
  const fetchPage = (page: number) =>
    request(page, SEARCH_CATALOG_PAGE_SIZE).pipe(map(({ payload }) => payload));

  return fetchPage(1).pipe(
    switchMap(({ data, metadata }) => {
      if (metadata.totalPages <= 1) return of(data);
      const rest = Array.from({ length: metadata.totalPages - 1 }, (_, i) => fetchPage(i + 2));
      return forkJoin(rest).pipe(map((pages) => data.concat(...pages.map((p) => p.data))));
    }),
  );
}
