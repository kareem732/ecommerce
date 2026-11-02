import type { LucideIconData } from 'lucide-angular';

export interface ConfirmationDialogData {
  message: string;
  icon?: LucideIconData;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}
