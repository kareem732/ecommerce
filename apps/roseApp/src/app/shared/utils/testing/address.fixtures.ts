import {
  Address,
  AddressMessageResponse,
  AddressResponse,
  AddressesResponse,
} from '../../../features/shop/interfaces/address.model/address-response';
import { AddressLike } from '../../../features/shop/interfaces/address.model/address.types';

export const makeAddress = (overrides: Partial<Address> = {}): Address => ({
  id: 'a1',
  userId: 'u1',
  title: 'Home',
  isPrimary: true,
  city: 'New York',
  street: '123 Main St, Apt 4',
  phone: '+1234567890',
  latitude: '40.7128',
  longitude: '-74.006',
  createdAt: '2026-11-11T11:20:55.534Z',
  updatedAt: '2026-11-11T11:20:55.534Z',
  ...overrides,
});

export const makeAddressLike = (overrides: Partial<AddressLike> = {}): AddressLike => ({
  id: 'a1',
  title: 'Home',
  city: 'Giza',
  street: '21 Ahmad Mohamed St',
  phone: '+201012346578',
  isPrimary: false,
  lat: 30.01,
  lng: 31.2,
  ...overrides,
});

export const makeAddressesResponse = (addresses: Address[] = []): AddressesResponse => ({
  status: true,
  code: 200,
  payload: { addresses },
});

export const makeAddressResponse = (
  address: Address = makeAddress(),
  code = 200,
): AddressResponse => ({
  status: true,
  code,
  payload: { address },
});

export const makeAddressMessageResponse = (
  message = 'Address deleted successfully.',
): AddressMessageResponse => ({
  status: true,
  code: 200,
  message,
});
