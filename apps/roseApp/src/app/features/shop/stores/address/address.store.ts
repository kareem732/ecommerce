import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {
  AddressRequest,
  UpdateAddressRequest,
} from '../../interfaces/address.model/address-request';
import { toAddressLike } from '../../utils/address.mapper';
import { ShopService } from '../../services/shop.service';
import { initialAddressState } from './address.state';
import { readSelectedAddressId, writeSelectedAddressId } from './address.storage';
import { pickSelection, sortByTitle } from './address.utils';

export const AddressStore = signalStore(
  { providedIn: 'root' },
  withState(initialAddressState),
  withComputed(({ addresses, selectedId }) => {
    const items = computed(() => addresses().map(toAddressLike));

    return {
      items,
      count: computed(() => addresses().length),
      groupedItems: computed(() => sortByTitle(items())),
      selectedAddress: computed(() => items().find((a) => a.id === selectedId()) ?? null),
    };
  }),
  withMethods((store, api = inject(ShopService)) => {
    let inflight: Promise<boolean> | null = null;

    const setSelected = (id: string | null): void => {
      patchState(store, { selectedId: id });
      writeSelectedAddressId(id);
    };

    const fetchAddresses = async (): Promise<boolean> => {
      patchState(store, { loading: true });
      try {
        const { payload } = await firstValueFrom(api.getAddresses());
        const selectedId = pickSelection(
          payload.addresses,
          store.selectedId() ?? readSelectedAddressId(),
        );
        patchState(store, { addresses: payload.addresses, selectedId, loaded: true });
        writeSelectedAddressId(selectedId);
        return true;
      } catch {
        return false;
      } finally {
        patchState(store, { loading: false });
      }
    };

    const startRequest = (): Promise<boolean> => {
      const request: Promise<boolean> = fetchAddresses().finally(() => {
        if (inflight === request) inflight = null;
      });
      inflight = request;
      return request;
    };

    const load = (force = false): Promise<boolean> => {
      if (inflight) return force ? inflight.then(startRequest) : inflight;
      if (store.loaded() && !force) return Promise.resolve(true);
      return startRequest();
    };

    const mutate = async <T>(
      run: () => Promise<T>,
      after?: (result: T) => void,
    ): Promise<boolean> => {
      patchState(store, { saving: true });
      try {
        const result = await run();
        await load(true);
        after?.(result);
        return true;
      } catch {
        return false;
      } finally {
        patchState(store, { saving: false });
      }
    };

    return {
      load: (): Promise<boolean> => load(),

      select: setSelected,

      add: (body: AddressRequest): Promise<boolean> =>
        mutate(
          () => firstValueFrom(api.addAddress(body)),
          (res) => setSelected(res.payload.address.id),
        ),

      update: (id: string, body: UpdateAddressRequest): Promise<boolean> =>
        mutate(
          () => firstValueFrom(api.updateAddress(id, body)),
          () => {
            if (body.isPrimary) setSelected(id);
          },
        ),

      remove: (id: string): Promise<boolean> =>
        mutate(() => firstValueFrom(api.deleteAddress(id))),

      reset(): void {
        patchState(store, initialAddressState);
        writeSelectedAddressId(null);
      },
    };
  }),
);
