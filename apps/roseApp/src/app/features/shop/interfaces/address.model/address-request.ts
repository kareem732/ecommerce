export interface AddressRequest {
  title: string;
  isPrimary: boolean;
  city: string;
  street: string;
  phone: string;
  latitude: number;
  longitude: number;
}

export type UpdateAddressRequest = Partial<AddressRequest>;
