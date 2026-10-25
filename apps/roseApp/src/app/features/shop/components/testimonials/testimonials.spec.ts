import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { TestimonialsResponse } from '../../interfaces/home.Testimonial/Testimonial';
import { ShopService } from '../../services/shop.service';
import { HomeStore } from '../../stores/home/home.store';
import { makeOccasionsResponse,makeProductsResponse} from '../../../../shared/utils/testing/product.fixtures';
import { provideTranslateTesting, useEnglish } from '../../../../shared/utils/testing/translate.testing';
import { Testimonials } from './testimonials';
import { makeTestimonialsResponse, makeTestimonial } from '../../../../shared/utils/testing/testimonial.fixtures';

describe('Testimonials', () => {
  let fixture: ComponentFixture<Testimonials>;
  let element: HTMLElement;
  let testimonialsResult: () => Observable<TestimonialsResponse>;

  const cards = () => element.querySelectorAll('app-testimonial-card');

  const setup = async () => {
    await TestBed.configureTestingModule({
      imports: [Testimonials],
      providers: [
        HomeStore,
        {
          provide: ShopService,
          useValue: {
            getProducts: () => of(makeProductsResponse([])),
            getOccasions: () => of(makeOccasionsResponse([])),
            getTestimonials: () => testimonialsResult(),
          },
        },
        provideTranslateTesting(),
      ],
    }).compileComponents();
    useEnglish();

    fixture = TestBed.createComponent(Testimonials);
    element = fixture.nativeElement;
    fixture.detectChanges();
    await fixture.whenStable();
  };

  beforeEach(() => {
    testimonialsResult = () =>
      of(
        makeTestimonialsResponse([
          makeTestimonial({ id: 't1', name: 'Sara' }),
          makeTestimonial({ id: 't2', name: 'Omar' }),
        ]),
      );
  });

  it('renders a card for every testimonial', async () => {
    await setup();

    const names = Array.from(element.querySelectorAll('app-testimonial-card h3')).map((el) =>
      el.textContent?.trim(),
    );
    expect(cards()).toHaveLength(2);
    expect(names).toEqual(['Sara', 'Omar']);
  });

  it('renders no cards when there are no testimonials', async () => {
    testimonialsResult = () => of(makeTestimonialsResponse([]));
    await setup();

    expect(cards()).toHaveLength(0);
  });

  it('renders no cards when the request fails', async () => {
    testimonialsResult = () => throwError(() => new Error('offline'));
    await setup();

    expect(cards()).toHaveLength(0);
    expect(element.querySelector('app-section-title')).toBeTruthy();
  });
});
