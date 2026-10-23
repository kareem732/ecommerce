import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureSection } from './feature-section';
import { provideTranslateTesting, useEnglish } from '../../../../shared/utils/testing/translate.testing';

describe('FeatureSection', () => {
  let fixture: ComponentFixture<FeatureSection>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureSection],
      providers: [provideTranslateTesting()],
    }).compileComponents();

    useEnglish();
    fixture = TestBed.createComponent(FeatureSection);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should render the four features', () => {
    expect(el.querySelectorAll('.features__item').length).toBe(4);
  });

  it('should render translated titles and texts', () => {
    const titles = [...el.querySelectorAll('.features__title')].map((t) => t.textContent?.trim());
    expect(titles).toEqual(['Free Delivery', 'Get Refund', 'Safe Payment', '24/7 Support']);
    expect(el.querySelector('.features__text')?.textContent?.trim()).toBe('For orders above 120 EGP');
  });
});
