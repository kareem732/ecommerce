import { describe, expect, it } from 'vitest';
import { makeAddress, makeAddressLike } from '../../../shared/utils/testing/address.fixtures';
import {
  toAddressDetails,
  toAddressLike,
  toAddressRequest,
  toMapPoint,
  toUpdateRequest,
} from './address.mapper';
import { AddressDraft } from '../interfaces/address.model/address.types';

const draft: AddressDraft = {
  title: 'Work',
  city: 'Giza',
  street: '21 Ahmad Mohamed St',
  phone: '+201012346578',
  isPrimary: false,
  lat: 30.01,
  lng: 31.2,
};

describe('address mapper', () => {
  describe('toAddressLike', () => {
    it('parses string coordinates into numbers', () => {
      const result = toAddressLike(makeAddress({ latitude: '30.01', longitude: '31.2' }));

      expect(result).toMatchObject({ id: 'a1', title: 'Home', lat: 30.01, lng: 31.2 });
    });

    it('returns null for missing or invalid coordinates', () => {
      const result = toAddressLike(makeAddress({ latitude: '', longitude: 'abc' }));

      expect(result.lat).toBeNull();
      expect(result.lng).toBeNull();
    });
  });

  describe('toAddressDetails / toMapPoint', () => {
    it('returns null without an address', () => {
      expect(toAddressDetails(null)).toBeNull();
      expect(toMapPoint(null)).toBeNull();
    });

    it('extracts the editable details, including the category, and the point', () => {
      const address = makeAddressLike({ title: 'Family', isPrimary: true });

      expect(toAddressDetails(address)).toEqual({
        title: 'Family',
        city: 'Giza',
        street: '21 Ahmad Mohamed St',
        phone: '+201012346578',
        isPrimary: true,
      });
      expect(toMapPoint(address)).toEqual({ lat: 30.01, lng: 31.2 });
    });

    it('returns no point when a coordinate is missing', () => {
      expect(toMapPoint(makeAddressLike({ lng: null }))).toBeNull();
    });
  });

  describe('toAddressRequest', () => {
    it('maps the draft, using its category as the title', () => {
      expect(toAddressRequest(draft)).toEqual({
        title: 'Work',
        isPrimary: false,
        city: 'Giza',
        street: '21 Ahmad Mohamed St',
        phone: '+201012346578',
        latitude: 30.01,
        longitude: 31.2,
      });
    });

    it('forces primary when asked', () => {
      expect(toAddressRequest(draft, true).isPrimary).toBe(true);
    });
  });

  it('toUpdateRequest maps the draft including the category', () => {
    expect(toUpdateRequest(draft)).toEqual({
      title: 'Work',
      city: 'Giza',
      street: '21 Ahmad Mohamed St',
      phone: '+201012346578',
      isPrimary: false,
      latitude: 30.01,
      longitude: 31.2,
    });
  });
});
