import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { Carousel } from 'primeng/carousel';
import { HeroSlider } from './hero-slider';
import { HERO_SLIDES } from '../promo-banners.constants';
import { provideTranslateTesting, useEnglish } from '../../../../../shared/utils/testing/translate.testing';

describe('HeroSlider', () => {
  let fixture: ComponentFixture<HeroSlider>;
  let el: HTMLElement;

  const carousel = () => fixture.debugElement.query(By.directive(Carousel)).componentInstance as Carousel;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroSlider],
      providers: [provideRouter([]), provideTranslateTesting()],
    }).compileComponents();

    useEnglish();
    fixture = TestBed.createComponent(HeroSlider);
    fixture.componentRef.setInput('slides', HERO_SLIDES);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should show one looping slide at a time', () => {
    expect(carousel().numVisible).toBe(1);
    expect(carousel().circular).toBe(true);
  });

  it('should render a card for every slide', () => {
    const titles = [...el.querySelectorAll('.p-carousel-item:not(.p-carousel-item-clone) .promo-card__title')].map(
      (title) => title.textContent?.trim(),
    );

    expect(titles).toEqual(['Say It with Flowers', 'Love in Full Bloom', 'Sweet Little Surprises', 'Wrapped with Love']);
  });

  it('should pass the interval to autoplay', () => {
    expect(carousel().autoplayInterval).toBe(5000);

    fixture.componentRef.setInput('interval', 0);
    fixture.detectChanges();
    expect(carousel().autoplayInterval).toBe(0);
  });

  it('should render one indicator per slide', () => {
    expect(el.querySelectorAll('.p-carousel-indicator').length).toBe(HERO_SLIDES.length);
  });
});
