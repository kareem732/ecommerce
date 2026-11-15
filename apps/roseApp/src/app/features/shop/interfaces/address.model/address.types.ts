export interface AddressDetails {
  title: string;
  city: string;
  street: string;
  phone: string;
  isPrimary: boolean;
}

export interface MapPoint {
  lat: number;
  lng: number;
}

export type AddressDraft = AddressDetails & MapPoint;

export interface AddressLike {
  id: string;
  title: string;
  city: string;
  street: string;
  phone: string;
  isPrimary: boolean;
  lat: number | null;
  lng: number | null;
}
