import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PromoBanners } from './promo-banners';
import { HERO_SLIDES, OCCASION_BANNERS } from './promo-banners.constants';
import { provideTranslateTesting, useEnglish } from '../../../../shared/utils/testing/translate.testing';

describe('PromoBanners', () => {
  let fixture: ComponentFixture<PromoBanners>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromoBanners],
      providers: [provideRouter([]), provideTranslateTesting()],
    }).compileComponents();

    useEnglish();
    fixture = TestBed.createComponent(PromoBanners);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should render the special gifts card and the hero slider', () => {
    expect(el.querySelector('.promo__special .promo-card__title')?.textContent?.trim()).toBe(
      'Special Gifts For The People You Love',
    );
    expect(el.querySelectorAll('.promo__hero .p-carousel-item:not(.p-carousel-item-clone)').length).toBe(
      HERO_SLIDES.length,
    );
  });

  it('should render one card per occasion', () => {
    const badges = [...el.querySelectorAll('.promo__occasion .promo-card__badge')].map((badge) =>
      badge.textContent?.trim(),
    );

    expect(badges.length).toBe(OCCASION_BANNERS.length);
    expect(badges).toEqual(['Wedding', 'Engagement', 'Anniversary']);
  });
});
