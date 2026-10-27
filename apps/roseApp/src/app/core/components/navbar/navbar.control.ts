import { ClipboardList, Gift, Headphones, House, Info, PartyPopper } from 'lucide-angular';
import { NavItem } from './navbar.model';

export const NAVBAR_NAVIGATION_LINKS: NavItem[] = [
  { id: 'home', labelKey: 'NAV.HOME', route: '/shop/home', icon: House },
  { id: 'products', labelKey: 'NAV.PRODUCTS', route: '/shop/products', icon: Gift },
  { id: 'categories', labelKey: 'NAV.CATEGORIES', route: '/shop/categories', icon: ClipboardList },
  { id: 'occasions', labelKey: 'NAV.OCCASIONS', route: '/shop/occasions', icon: PartyPopper },
  { id: 'contact', labelKey: 'NAV.CONTACT', route: '/shop/contact', icon: Headphones },
  { id: 'about', labelKey: 'NAV.ABOUT', route: '/shop/about', icon: Info },
];
