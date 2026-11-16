export const ADDRESS_TITLES = ['Home', 'Work', 'Family'] as const;

export type AddressTitle = (typeof ADDRESS_TITLES)[number];

export const DEFAULT_ADDRESS_TITLE: AddressTitle = ADDRESS_TITLES[0];

export const ADDRESS_TITLE_OPTIONS = ADDRESS_TITLES.map((value) => ({
  value,
  labelKey: `ADDRESS.CATEGORIES.${value.toUpperCase()}`,
}));

export const SELECTED_ADDRESS_STORAGE_KEY = 'rose.selectedAddressId';
