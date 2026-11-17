import { Lock, UserPen } from 'lucide-angular';
import { AccountRoute } from '../enums/account-route.enum';
import { AccountNavItem } from '../interfaces/account-nav-item.interface';

const ACCOUNT_BASE_PATH = '/shop/account';

export const ACCOUNT_PATHS = {
  profile: `${ACCOUNT_BASE_PATH}/${AccountRoute.Profile}`,
  changePassword: `${ACCOUNT_BASE_PATH}/${AccountRoute.ChangePassword}`,
} as const;

export const ACCOUNT_NAV_ITEMS: readonly AccountNavItem[] = [
  { route: AccountRoute.Profile, label: 'ACCOUNT.NAV.PROFILE', icon: UserPen },
  { route: AccountRoute.ChangePassword, label: 'ACCOUNT.NAV.CHANGE_PASSWORD', icon: Lock },
];

export const AVATAR_ACCEPTED_TYPES: readonly string[] = ['image/jpeg', 'image/png', 'image/gif'];
export const AVATAR_MAX_SIZE_BYTES = 5 * 1024 * 1024;
