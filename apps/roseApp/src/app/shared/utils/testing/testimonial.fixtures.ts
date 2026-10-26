import { TestimonialRes, TestimonialsResponse } from "../../../features/shop/interfaces/home.Testimonial/Testimonial";

export const makeTestimonial = (overrides: Partial<TestimonialRes> = {}): TestimonialRes => ({
  id: 't1',
  name: 'Test User',
  email: 'test@example.com',
  content: 'Great service!',
  rating: 5,
  image: null,
  isApproved: true,
  immutable: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

export const makeTestimonialsResponse = (data: TestimonialRes[]): TestimonialsResponse => ({
  status: true,
  code: 200,
  payload: { data, metadata: { page: 1, limit: 10, total: data.length, totalPages: 1 } },
});
