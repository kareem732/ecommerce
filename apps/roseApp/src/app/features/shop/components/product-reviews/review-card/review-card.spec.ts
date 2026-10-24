import { ComponentFixture, TestBed } from '@angular/core/testing';
import { makeReview } from '../../../../../shared/utils/testing/review.fixtures';
import { provideTranslateTesting, useEnglish } from '../../../../../shared/utils/testing/translate.testing';
import { ReviewCard } from './review-card';

describe('ReviewCard', () => {
  let fixture: ComponentFixture<ReviewCard>;
  let element: HTMLElement;

  const text = (selector: string) => element.querySelector(selector)?.textContent?.trim();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewCard],
      providers: [provideTranslateTesting()],
    }).compileComponents();
    useEnglish();

    fixture = TestBed.createComponent(ReviewCard);
    element = fixture.nativeElement;
  });

  it('should show the author, date, rating and text', async () => {
    fixture.componentRef.setInput('review', makeReview({ rating: 4 }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(text('.review__avatar')).toBe('A');
    expect(text('.review__name')).toBe('Adrian Smith');
    expect(text('.review__date')).toBe('Apr 7, 2025');
    expect(text('.review__rating-value')).toBe('(4)');
    expect(text('.review__headline')).toBe('Awesome Bouquet!');
    expect(text('.review__content')).toBe('Fresh and beautifully arranged.');
  });

  it('should hide the content when the review has none', async () => {
    fixture.componentRef.setInput('review', makeReview({ content: '' }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(element.querySelector('.review__content')).toBeNull();
  });
});
