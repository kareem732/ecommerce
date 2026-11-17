import { LucideIconData } from 'lucide-angular';
import { AccountRoute } from '../enums/account-route.enum';

export interface AccountNavItem {
  route: AccountRoute;
  label: string;
  icon: LucideIconData;
}
