import { Clock, LucideIconData, Mail, MapPin, Phone } from 'lucide-angular';

export interface ContactChannel {
  id: string;
  labelKey: string;
  /** Literal value (phone/email) or a translation key when `translate` is true. */
  value: string;
  translate?: boolean;
  href?: string;
  icon: LucideIconData;
}

// TODO: replace with the store's real contact details.
export const CONTACT_EMAIL = 'support@rose-app.com';
const CONTACT_PHONE = '+20 100 000 0000';

export const CONTACT_CHANNELS: readonly ContactChannel[] = [
  { id: 'phone', labelKey: 'CONTACT.PHONE', value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE.replace(/\s/g, '')}`, icon: Phone },
  { id: 'email', labelKey: 'CONTACT.EMAIL', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, icon: Mail },
  { id: 'address', labelKey: 'CONTACT.ADDRESS', value: 'CONTACT.ADDRESS_VALUE', translate: true, icon: MapPin },
  { id: 'hours', labelKey: 'CONTACT.HOURS', value: 'CONTACT.HOURS_VALUE', translate: true, icon: Clock },
];
