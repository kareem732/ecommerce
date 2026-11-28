import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import OverviewApi from '../bases/overview.Api';
import OverviewEndPoint from '../enums/end-points';
import { OverviewQuery } from '../interfaces/overview.req';
import { OverviewResponse } from '../interfaces/overview.res';

@Injectable({
  providedIn: 'root',
})
export class OverviewService implements OverviewApi {
  private readonly _httpClient = inject(HttpClient);

  getStatistics(
    query: OverviewQuery = {},
    context?: HttpContext,
  ): Observable<OverviewResponse> {
    return this._httpClient.get<OverviewResponse>(OverviewEndPoint.STATISTICS, {
      context,
      params: this.buildParams(query),
    });
  }

  private buildParams(query: OverviewQuery): HttpParams {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }
}
