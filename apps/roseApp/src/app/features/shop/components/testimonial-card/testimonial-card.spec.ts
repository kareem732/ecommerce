import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestimonialCard } from './testimonial-card';
import { TestimonialRes } from '../../interfaces/home.Testimonial/Testimonial';

const mockTestimonial: TestimonialRes = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  content: 'Great service!',
  rating: 4,
  image: null,
  isApproved: true,
  immutable: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('TestimonialCard', () => {
  let component: TestimonialCard;
  let fixture: ComponentFixture<TestimonialCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestimonialCard],
    }).compileComponents();

    fixture = TestBed.createComponent(TestimonialCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('testimonial', mockTestimonial);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should show 4 filled stars and 1 empty for rating 4', () => {
    expect(component.stars).toEqual([true, true, true, true, false]);
  });
});
