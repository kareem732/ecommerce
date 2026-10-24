import { PromoBanner } from './promo-banners.types';

const IMAGES_PATH = '/images/promo';
const PRODUCTS_LINK = '/shop/products';

export const HERO_AUTOPLAY_INTERVAL = 5000;

export const SPECIAL_GIFTS_BANNER: PromoBanner = {
  id: 'special-gifts',
  image: `${IMAGES_PATH}/special-gifts.webp`,
  badgeKey: 'SHOP.PROMO.SPECIAL_GIFTS.BADGE',
  titleKey: 'SHOP.PROMO.SPECIAL_GIFTS.TITLE',
  cta: { labelKey: 'SHOP.PROMO.SPECIAL_GIFTS.CTA', link: PRODUCTS_LINK, withArrow: true },
};

const heroSlide = (id: string, image: string, key: string): PromoBanner => ({
  id,
  image: `${IMAGES_PATH}/${image}.webp`,
  titleKey: `SHOP.PROMO.SLIDES.${key}.TITLE`,
  subtitleKey: `SHOP.PROMO.SLIDES.${key}.SUBTITLE`,
  cta: { labelKey: 'SHOP.PROMO.SLIDES.CTA', link: PRODUCTS_LINK },
});

export const HERO_SLIDES: PromoBanner[] = [
  heroSlide('flowers', 'hero-flowers-chocolate', 'FLOWERS'),
  heroSlide('roses', 'hero-roses-hearts', 'ROSES'),
  heroSlide('sweets', 'hero-roses-box', 'SWEETS'),
  heroSlide('gifts', 'hero-gifts-rings', 'GIFTS'),
];

const occasionBanner = (id: string, key: string): PromoBanner => ({
  id,
  image: `${IMAGES_PATH}/${id}.webp`,
  badgeKey: `SHOP.PROMO.OCCASIONS.${key}.BADGE`,
  titleKey: `SHOP.PROMO.OCCASIONS.${key}.TITLE`,
  link: PRODUCTS_LINK,
});

export const OCCASION_BANNERS: PromoBanner[] = [
  occasionBanner('wedding', 'WEDDING'),
  occasionBanner('engagement', 'ENGAGEMENT'),
  occasionBanner('anniversary', 'ANNIVERSARY'),
];
