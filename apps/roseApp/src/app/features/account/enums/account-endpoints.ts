import { environment } from '../../../../environments/environment';

export default class AccountEndPoint {
  static readonly UPLOAD = `${environment.apiUrl}/api/upload`;
  static readonly PROFILE = `${environment.apiUrl}/api/users/profile`;
  static readonly DELETE_ACCOUNT = `${environment.apiUrl}/api/users/account`;
  static readonly CHANGE_PASSWORD = `${environment.apiUrl}/api/users/change-password`;
}
