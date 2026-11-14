export const ADDRESS_FIELD_LIMITS = {
  cityMax: 60,
  streetMin: 5,
  streetMax: 250,
} as const;

export const ADDRESS_FORM_ERROR_KEYS: Readonly<Record<string, string>> = {
  required: 'ADDRESS.ERRORS.REQUIRED',
  phone: 'ADDRESS.ERRORS.PHONE_INVALID',
  minlength: 'ADDRESS.ERRORS.STREET_SHORT',
};

export const FALLBACK_ERROR_KEY = 'ADDRESS.ERRORS.INVALID';
