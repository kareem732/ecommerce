import { CountryCode } from 'libphonenumber-js';

export interface Country {
  code: CountryCode;
  name: string;
  dial: string;
}
