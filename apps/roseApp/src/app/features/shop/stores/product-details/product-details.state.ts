import { Product } from '../../interfaces/home.model/home-model-response';
import { ProductDetailsState } from '../../interfaces/product-details.model/product-details.model';

export type ProductDetailsStoreState = {
  productId: string | null;
  product: Product | null;
  status: ProductDetailsState;
  activeIndex: number;
  thumbPage: number;
};

export const initialState: ProductDetailsStoreState = {
  productId: null,
  product: null,
  status: 'loading',
  activeIndex: 0,
  thumbPage: 0,
};
