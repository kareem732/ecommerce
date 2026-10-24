import { LucideIconData } from 'lucide-angular';

export interface NavItem {
  id: string;
  labelKey: string;
  route: string;
  icon: LucideIconData;
}