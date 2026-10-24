import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateTesting, useEnglish } from '../../../../../shared/utils/testing/translate.testing';
import { RatingStars } from './rating-stars';

describe('RatingStars', () => {
  let fixture: ComponentFixture<RatingStars>;
  let element: HTMLElement;

  const render = async (rating: number) => {
    fixture.componentRef.setInput('rating', rating);
    fixture.detectChanges();
    await fixture.whenStable();
  };

  const count = (selector: string) => element.querySelectorAll(selector).length;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingStars],
      providers: [provideTranslateTesting()],
    }).compileComponents();
    useEnglish();

    fixture = TestBed.createComponent(RatingStars);
    element = fixture.nativeElement;
  });

  it('should render full, half and empty stars', async () => {
    await render(3.5);

    expect(count('.star')).toBe(5);
    expect(count('.star--full')).toBe(3);
    expect(count('lucide-angular.star__half')).toBe(1);
  });

  it('should round to the nearest half star', async () => {
    await render(4.3);

    expect(count('.star--full')).toBe(4);
    expect(count('lucide-angular.star__half')).toBe(1);
  });

  it('should describe the rating for screen readers', async () => {
    await render(4);

    expect(element.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('Rating 4 out of 5');
  });
});
