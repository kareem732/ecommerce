import { Address } from '../../interfaces/address.model/address-response';

export interface AddressState {
  addresses: Address[];
  selectedId: string | null;
  loaded: boolean;
  loading: boolean;
  saving: boolean;
}

export const initialAddressState: AddressState = {
  addresses: [],
  selectedId: null,
  loaded: false,
  loading: false,
  saving: false,
};
