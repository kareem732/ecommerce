import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SELECTED_ADDRESS_STORAGE_KEY } from '../../constants/address.constants';
import { AddressRequest } from '../../interfaces/address.model/address-request';
import { Address } from '../../interfaces/address.model/address-response';
import { ShopService } from '../../services/shop.service';
import {
  makeAddress,
  makeAddressMessageResponse,
  makeAddressResponse,
  makeAddressesResponse,
} from '../../../../shared/utils/testing/address.fixtures';
import { initialAddressState } from './address.state';
import { AddressStore } from './address.store';

describe('AddressStore', () => {
  const home = makeAddress({ id: 'a1', title: 'Home', isPrimary: true });
  const work = makeAddress({ id: 'a2', title: 'Work', isPrimary: false });
  const family = makeAddress({ id: 'a3', title: 'Family', isPrimary: false });

  const body: AddressRequest = {
    title: 'Family',
    isPrimary: false,
    city: 'Giza',
    street: '21 Ahmed Mohamed St',
    phone: '+201012345678',
    latitude: 30.01,
    longitude: 31.2,
  };

  let api: {
    getAddresses: ReturnType<typeof vi.fn>;
    addAddress: ReturnType<typeof vi.fn>;
    updateAddress: ReturnType<typeof vi.fn>;
    deleteAddress: ReturnType<typeof vi.fn>;
  };
  let store: InstanceType<typeof AddressStore>;

  const respondWith = (...addresses: Address[]) =>
    api.getAddresses.mockReturnValue(of(makeAddressesResponse(addresses)));
  const failure = () => throwError(() => new Error('boom'));

  beforeEach(() => {
    localStorage.clear();
    api = {
      getAddresses: vi.fn().mockReturnValue(of(makeAddressesResponse([]))),
      addAddress: vi.fn(),
      updateAddress: vi.fn(),
      deleteAddress: vi.fn(),
    };
    TestBed.configureTestingModule({ providers: [{ provide: ShopService, useValue: api }] });
    store = TestBed.inject(AddressStore);
  });

  it('starts empty, idle and without a selection', () => {
    expect(store.addresses()).toEqual(initialAddressState.addresses);
    expect(store.selectedId()).toBeNull();
    expect(store.loaded()).toBe(false);
    expect(store.loading()).toBe(false);
    expect(store.saving()).toBe(false);
    expect(store.count()).toBe(0);
  });

  describe('load', () => {
    it('stores the addresses and selects the primary one', async () => {
      respondWith(work, home);

      const ok = await store.load();

      expect(ok).toBe(true);
      expect(store.addresses()).toEqual([work, home]);
      expect(store.selectedId()).toBe('a1');
      expect(store.selectedAddress()?.city).toBe(home.city);
      expect(store.loaded()).toBe(true);
      expect(store.loading()).toBe(false);
    });

    it('falls back to the first address when none is primary', async () => {
      respondWith(work, family);

      await store.load();

      expect(store.selectedId()).toBe('a2');
    });

    it('restores the saved selection', async () => {
      localStorage.setItem(SELECTED_ADDRESS_STORAGE_KEY, 'a2');
      respondWith(home, work);

      await store.load();

      expect(store.selectedId()).toBe('a2');
    });

    it('has no selection when there are no addresses', async () => {
      await store.load();

      expect(store.selectedId()).toBeNull();
      expect(store.selectedAddress()).toBeNull();
    });

    it('does not refetch once loaded', async () => {
      respondWith(home);

      await store.load();
      await store.load();

      expect(api.getAddresses).toHaveBeenCalledTimes(1);
    });

    it('shares one request between concurrent calls', async () => {
      respondWith(home);

      await Promise.all([store.load(), store.load()]);

      expect(api.getAddresses).toHaveBeenCalledTimes(1);
    });

    it('returns false on failure and retries on the next call', async () => {
      api.getAddresses.mockReturnValueOnce(failure());

      expect(await store.load()).toBe(false);
      expect(store.loaded()).toBe(false);
      expect(store.loading()).toBe(false);

      respondWith(home);
      expect(await store.load()).toBe(true);
      expect(api.getAddresses).toHaveBeenCalledTimes(2);
    });
  });

  describe('select', () => {
    it('changes the selected address and persists it', async () => {
      respondWith(home, work);
      await store.load();

      store.select('a2');

      expect(store.selectedAddress()?.id).toBe('a2');
      expect(localStorage.getItem(SELECTED_ADDRESS_STORAGE_KEY)).toBe('a2');
    });

    it('keeps the selection when the list is reloaded after an update', async () => {
      respondWith(home, work);
      await store.load();
      store.select('a2');
      api.updateAddress.mockReturnValue(of(makeAddressResponse(home)));

      await store.update('a1', { city: 'Brooklyn' });

      expect(api.getAddresses).toHaveBeenCalledTimes(2);
      expect(store.selectedId()).toBe('a2');
    });
  });

  describe('add', () => {
    it('creates the address, reloads and selects the new one', async () => {
      api.addAddress.mockReturnValue(of(makeAddressResponse(family, 201)));
      respondWith(home, family);

      const ok = await store.add(body);

      expect(ok).toBe(true);
      expect(api.addAddress).toHaveBeenCalledWith(body);
      expect(store.addresses()).toEqual([home, family]);
      expect(store.selectedId()).toBe('a3');
      expect(store.saving()).toBe(false);
    });

    it('returns false and stops saving when the request fails', async () => {
      api.addAddress.mockReturnValue(failure());

      const ok = await store.add(body);

      expect(ok).toBe(false);
      expect(store.saving()).toBe(false);
    });
  });

  describe('update', () => {
    it('updates the address and reloads the list', async () => {
      const renamed = { ...work, city: 'Brooklyn' };
      api.updateAddress.mockReturnValue(of(makeAddressResponse(renamed)));
      respondWith(home, renamed);

      const ok = await store.update('a2', { city: 'Brooklyn' });

      expect(ok).toBe(true);
      expect(api.updateAddress).toHaveBeenCalledWith('a2', { city: 'Brooklyn' });
      expect(store.items()[1].city).toBe('Brooklyn');
    });

    it('selects the address when it becomes primary', async () => {
      respondWith(home, work);
      await store.load();
      api.updateAddress.mockReturnValue(of(makeAddressResponse(work)));

      await store.update('a2', { isPrimary: true });

      expect(store.selectedId()).toBe('a2');
    });

    it('returns false when the request fails', async () => {
      api.updateAddress.mockReturnValue(failure());

      expect(await store.update('missing', { city: 'x' })).toBe(false);
    });
  });

  describe('remove', () => {
    it('deletes the address and reloads the list', async () => {
      respondWith(home, work);
      await store.load();
      api.deleteAddress.mockReturnValue(of(makeAddressMessageResponse()));
      respondWith(home);

      const ok = await store.remove('a2');

      expect(ok).toBe(true);
      expect(api.deleteAddress).toHaveBeenCalledWith('a2');
      expect(store.addresses()).toEqual([home]);
    });

    it('re-selects another address when the selected one is deleted', async () => {
      respondWith(home, work);
      await store.load();
      store.select('a2');
      api.deleteAddress.mockReturnValue(of(makeAddressMessageResponse()));
      respondWith(home);

      await store.remove('a2');

      expect(store.selectedId()).toBe('a1');
    });

    it('returns false when the request fails', async () => {
      api.deleteAddress.mockReturnValue(failure());

      expect(await store.remove('missing')).toBe(false);
    });
  });

  describe('derived state', () => {
    it('maps the API addresses to numeric coordinates', async () => {
      respondWith(home);

      await store.load();

      expect(store.items()[0]).toMatchObject({ id: 'a1', lat: 40.7128, lng: -74.006 });
    });

    it('groups by title: Home, Work, Family, then other titles', async () => {
      const gym = makeAddress({ id: 'a4', title: 'Gym', isPrimary: false });
      respondWith(gym, family, work, home);

      await store.load();

      expect(store.groupedItems().map((a) => a.title)).toEqual([
        'Home',
        'Work',
        'Family',
        'Gym',
      ]);
      expect(store.items().map((a) => a.id)).toEqual(['a4', 'a3', 'a2', 'a1']);
    });
  });

  describe('reset', () => {
    it('clears the state and the saved selection', async () => {
      respondWith(home);
      await store.load();

      store.reset();

      expect(store.addresses()).toEqual([]);
      expect(store.selectedId()).toBeNull();
      expect(store.loaded()).toBe(false);
      expect(localStorage.getItem(SELECTED_ADDRESS_STORAGE_KEY)).toBeNull();
    });
  });
});
