import { AddressRequest, UpdateAddressRequest } from '../interfaces/address.model/address-request';
import { Address } from '../interfaces/address.model/address-response';
import { AddressDetails, AddressDraft, AddressLike, MapPoint } from '../interfaces/address.model/address.types';

const toCoordinate = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const toAddressLike = (address: Address): AddressLike => ({
  id: address.id,
  title: address.title,
  city: address.city,
  street: address.street,
  phone: address.phone,
  isPrimary: address.isPrimary,
  lat: toCoordinate(address.latitude),
  lng: toCoordinate(address.longitude),
});

export const toAddressDetails = (address: AddressLike | null): AddressDetails | null =>
  address
    ? {
        title: address.title,
        city: address.city,
        street: address.street,
        phone: address.phone,
        isPrimary: address.isPrimary,
      }
    : null;

export const toMapPoint = (address: AddressLike | null): MapPoint | null =>
  address && address.lat !== null && address.lng !== null
    ? { lat: address.lat, lng: address.lng }
    : null;

export const toAddressRequest = (draft: AddressDraft, forcePrimary = false): AddressRequest => ({
  title: draft.title,
  isPrimary: draft.isPrimary || forcePrimary,
  city: draft.city,
  street: draft.street,
  phone: draft.phone,
  latitude: draft.lat,
  longitude: draft.lng,
});

export const toUpdateRequest = (draft: AddressDraft): UpdateAddressRequest => ({
  title: draft.title,
  city: draft.city,
  street: draft.street,
  phone: draft.phone,
  isPrimary: draft.isPrimary,
  latitude: draft.lat,
  longitude: draft.lng,
});
