import { environment } from '../../../environments/environment';

export default class OverviewEndPoint {
  static readonly STATISTICS = `${environment.apiUrl}/api/admin/statistics`;
}
