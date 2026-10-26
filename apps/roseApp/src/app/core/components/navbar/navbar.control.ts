import { ClipboardList, Gift, Headphones, House, Info, PartyPopper } from "lucide-angular";
import { NavItem } from "./navbar.model";

  export const NAVBAR_NAVIGATION_LINKS: NavItem[] = [
    { id: 'home', labelKey: 'NAV.HOME', route: '/shop/home', icon: House },
    { id: 'products', labelKey: 'NAV.PRODUCTS', route: '/shop/home', icon: Gift },
    { id: 'categories', labelKey: 'NAV.CATEGORIES', route: '/shop/home', icon: ClipboardList },
    { id: 'occasions', labelKey: 'NAV.OCCASIONS', route: '/shop/home', icon: PartyPopper },
    { id: 'contact', labelKey: 'NAV.CONTACT', route: '/shop/home', icon: Headphones },
    { id: 'about', labelKey: 'NAV.ABOUT', route: '/shop/home', icon: Info },
  ];