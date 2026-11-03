import { WishlistItem } from '../../interfaces/wishlist.model/wishlist-response';

export type WishlistStatus = 'idle' | 'loading' | 'success' | 'error';

export interface WishlistState {
  items: WishlistItem[];
  status: WishlistStatus;
}

export const initialState: WishlistState = {
  items: [],
  status: 'idle',
};
