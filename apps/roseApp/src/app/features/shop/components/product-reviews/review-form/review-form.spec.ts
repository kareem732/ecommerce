import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { CreateReviewRequest } from '../../../interfaces/review.model/review-request';
import { ShopService } from '../../../services/shop.service';
import { provideTranslateTesting, useEnglish } from '../../../../../shared/utils/testing/translate.testing';
import { ReviewForm } from './review-form';

describe('ReviewForm', () => {
  let fixture: ComponentFixture<ReviewForm>;
  let element: HTMLElement;
  let requests: CreateReviewRequest[];
  let addReviewResult: () => Observable<unknown>;
  let submittedCount: number;

  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const query = <T extends Element>(selector: string): T => {
    const found = element.querySelector<T>(selector);
    if (!found) throw new Error(`Missing element: ${selector}`);
    return found;
  };

  // Like the browser, run change detection after each keystroke event.
  const type = async (selector: string, value: string) => {
    const field = query<HTMLInputElement | HTMLTextAreaElement>(selector);
    field.value = value;
    field.dispatchEvent(new Event('input'));
    await settle();
  };

  const rate = (stars: number) =>
    element.querySelectorAll<HTMLElement>('.p-rating-option')[stars - 1].click();

  const submit = async () => {
    query('form').dispatchEvent(new Event('submit'));
    await settle();
  };

  const setup = async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewForm],
      providers: [
        provideTranslateTesting(),
        {
          provide: ShopService,
          useValue: {
            addReview: (body: CreateReviewRequest) => {
              requests.push(body);
              return addReviewResult();
            },
          },
        },
      ],
    }).compileComponents();
    useEnglish();

    fixture = TestBed.createComponent(ReviewForm);
    fixture.componentRef.setInput('productId', 'product-1');
    fixture.componentInstance.submitted.subscribe(() => submittedCount++);
    element = fixture.nativeElement;
    await settle();
  };

  beforeEach(() => {
    requests = [];
    submittedCount = 0;
    addReviewResult = () => of({ status: true });
  });

  it('should not submit an incomplete review', async () => {
    await setup();

    await submit();

    expect(requests).toEqual([]);
    expect(element.textContent).toContain('Please choose a rating.');
    expect(element.textContent).toContain('Please enter a title.');
  });

  it('should send the trimmed review, reset the form and notify the parent', async () => {
    await setup();

    rate(4);
    await type('app-input input', '  Lovely  ');
    await type('app-textarea textarea', '   ');
    await submit();

    expect(requests).toEqual([{ productId: 'product-1', rating: 4, headline: 'Lovely' }]);
    expect(submittedCount).toBe(1);
    expect(element.textContent).toContain('Thanks! Your review has been added.');
    expect(query<HTMLInputElement>('app-input input').value).toBe('');
  });

  it('should show the API error and keep what the user typed', async () => {
    addReviewResult = () => throwError(() => ({ message: 'You already reviewed this product.' }));
    await setup();

    rate(5);
    await type('app-input input', 'Great');
    await submit();

    expect(submittedCount).toBe(0);
    expect(element.textContent).toContain('You already reviewed this product.');
    expect(query<HTMLInputElement>('app-input input').value).toBe('Great');
  });
});
