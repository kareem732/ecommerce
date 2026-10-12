import { LucideIconData } from 'lucide-angular';

export interface AccountMenuItem {
  id: string;
  label: string;
  icon?: LucideIconData;
  shortcut?: string;
  hasSubmenu?: boolean;
  disabled?: boolean;
}
