import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PromoCard } from './promo-card';
import { PromoBanner } from '../promo-banners.types';
import { provideTranslateTesting, useEnglish } from '../../../../../shared/utils/testing/translate.testing';

const BANNER: PromoBanner = {
  id: 'wedding',
  image: '/images/promo/wedding.webp',
  badgeKey: 'SHOP.PROMO.OCCASIONS.WEDDING.BADGE',
  titleKey: 'SHOP.PROMO.OCCASIONS.WEDDING.TITLE',
  link: '/shop/products',
};

describe('PromoCard', () => {
  let fixture: ComponentFixture<PromoCard>;
  let el: HTMLElement;

  const render = (banner: PromoBanner, inputs: Record<string, unknown> = {}) => {
    fixture.componentRef.setInput('banner', banner);
    Object.entries(inputs).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromoCard],
      providers: [provideRouter([]), provideTranslateTesting()],
    }).compileComponents();

    useEnglish();
    fixture = TestBed.createComponent(PromoCard);
    el = fixture.nativeElement;
  });

  it('should render the image, badge and translated title', () => {
    render(BANNER);

    expect(el.querySelector('img')?.getAttribute('src')).toBe(BANNER.image);
    expect(el.querySelector('.promo-card__badge')?.textContent?.trim()).toBe('Wedding');
    expect(el.querySelector('.promo-card__title')?.textContent?.trim()).toBe(
      'Celebrate Her Forever with a Gift She’ll Always Remember',
    );
  });

  it('should make the whole card a link when there is no cta', () => {
    render(BANNER);

    const link = el.querySelector('.promo-card__link');
    expect(link?.getAttribute('href')).toBe('/shop/products');
    expect(el.querySelector('.promo-card__cta')).toBeNull();
  });

  it('should render a cta button instead of the card link when cta is set', () => {
    render({
      ...BANNER,
      cta: { labelKey: 'SHOP.PROMO.SPECIAL_GIFTS.CTA', link: '/shop/products', withArrow: true },
    });

    const cta = el.querySelector('.promo-card__cta');
    expect(cta?.textContent?.trim()).toBe('Shop Now');
    expect(cta?.querySelector('lucide-angular')).not.toBeNull();
    expect(el.querySelector('.promo-card__link')).toBeNull();
  });

  it('should lazy load by default and load eagerly when priority is set', () => {
    render(BANNER);
    expect(el.querySelector('img')?.getAttribute('loading')).toBe('lazy');

    render(BANNER, { priority: true });
    expect(el.querySelector('img')?.getAttribute('loading')).toBe('eager');
  });

  it('should apply the hero modifier class for the hero variant', () => {
    render(BANNER, { variant: 'hero' });
    expect(el.classList).toContain('promo-card--hero');
  });
});
