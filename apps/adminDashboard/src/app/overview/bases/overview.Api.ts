import { HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OverviewQuery } from '../interfaces/overview.req';
import { OverviewResponse } from '../interfaces/overview.res';

export default abstract class OverviewApi {
  abstract getStatistics(
    query?: OverviewQuery,
    context?: HttpContext,
  ): Observable<OverviewResponse>;
}
