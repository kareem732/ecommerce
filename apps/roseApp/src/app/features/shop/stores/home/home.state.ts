import { Occasion, Product } from '../../interfaces/home.model/home-model-response';
import { TestimonialRes } from '../../interfaces/home.Testimonial/Testimonial';

export type HomeState = {
  bestSelling: Product[];
  occasions: Occasion[];
  selectedOccasionId: string | null;
  popular: Product[];
  popularLoading: boolean;
  testimonials: TestimonialRes[];
};

export const initialState: HomeState = {
  bestSelling: [],
  occasions: [],
  selectedOccasionId: null,
  popular: [],
  popularLoading: true,
  testimonials: [],
};
