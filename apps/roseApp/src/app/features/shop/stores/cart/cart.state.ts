import { CartItem } from '../../interfaces/cart.model/cart.model';

export type CartStatus = 'idle' | 'loading' | 'success' | 'error';

export interface CartState {
  items: CartItem[];
  status: CartStatus;
}

export const initialState: CartState = {
  items: [],
  status: 'idle',
};
