import { SELECTED_ADDRESS_STORAGE_KEY } from '../../constants/address.constants';

export const readSelectedAddressId = (): string | null => {
  try {
    return localStorage.getItem(SELECTED_ADDRESS_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const writeSelectedAddressId = (id: string | null): void => {
  try {
    if (id) localStorage.setItem(SELECTED_ADDRESS_STORAGE_KEY, id);
    else localStorage.removeItem(SELECTED_ADDRESS_STORAGE_KEY);
  } catch {
    return;
  }
};
