export interface TestimonialRes {
  id: string;
  name: string;
  email: string;
  content: string;
  rating: number;
  image: string | null;
  isApproved: boolean;
  immutable: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface Metadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TestimonialsResponse {
  status: boolean;
  code: number;
  payload: {
    data: TestimonialRes[];
    metadata: Metadata;
  };
}