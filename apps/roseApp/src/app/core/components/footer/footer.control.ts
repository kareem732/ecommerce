import { FooterLink } from "./footer.model";
export const FOOTER_NAVIGATION_LINKS: FooterLink[] = [
    { id: 'home', labelKey: 'FOOTER.HOME', route: '/shop/home' },
    { id: 'products', labelKey: 'FOOTER.PRODUCTS', route: '/shop/products' },
    { id: 'categories', labelKey: 'FOOTER.CATEGORIES', route: '/shop/categories' },
    { id: 'occasions', labelKey: 'FOOTER.OCCASIONS', route: '/shop/occasions' },
    { id: 'contact', labelKey: 'FOOTER.CONTACT', route: '/shop/contact' },
    { id: 'about', labelKey: 'FOOTER.ABOUT', route: '/shop/home', fragment: 'about' },
    { id: 'terms', labelKey: 'FOOTER.TERMS', route: '/shop/home' },
    { id: 'privacy', labelKey: 'FOOTER.PRIVACY', route: '/shop/home' },
    { id: 'faqs', labelKey: 'FOOTER.FAQS', route: '/shop/home' },
  ];