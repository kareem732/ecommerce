import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { providePrimeNG } from 'primeng/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfirmationDialogService } from '../../../../../shared/business/confirmation-dialog.service';
import { GoogleMapsLoader } from '../../../../../shared/business/google-maps-loader.service';
import { makeAddressLike } from '../../../../../shared/utils/testing/address.fixtures';
import { toAddressRequest, toUpdateRequest } from '../../../utils/address.mapper';
import { AddressDraft, AddressLike } from '../../../interfaces/address.model/address.types';
import { AddressStore } from '../../../stores/address/address.store';
import { MyAddressesModal } from './my-addresses-modal';

interface Internals {
  showForm(): boolean;
  editing(): AddressLike | null;
  openAdd(): void;
  openEdit(address: AddressLike): void;
  onSave(draft: AddressDraft): Promise<void>;
  onRemove(id: string): Promise<void>;
  onDialogVisibleChange(open: boolean): void;
}

const DRAFT: AddressDraft = {
  city: 'Cairo',
  street: '14 Omar St',
  phone: '01112345678',
  isPrimary: false,
  lat: 30.04,
  lng: 31.23,
};

const createStore = () => {
  const groupedItems = signal<AddressLike[]>([]);
  return {
    groupedItems,
    selectedId: signal<string | null>(null),
    loading: signal(false),
    saving: signal(false),
    count: computed(() => groupedItems().length),
    load: vi.fn().mockResolvedValue(true),
    select: vi.fn(),
    add: vi.fn().mockResolvedValue(true),
    update: vi.fn().mockResolvedValue(true),
    remove: vi.fn().mockResolvedValue(true),
  };
};

describe('MyAddressesModal', () => {
  const giza = makeAddressLike({ id: 'a1', title: 'Home', city: 'Giza' });
  const cairo = makeAddressLike({ id: 'a2', title: 'Work', city: 'Cairo' });

  let fixture: ComponentFixture<MyAddressesModal>;
  let store: ReturnType<typeof createStore>;
  let confirmation: { confirm: ReturnType<typeof vi.fn> };

  const modal = () => fixture.componentInstance as unknown as Internals;
  const items = () => document.querySelectorAll('app-address-item');

  const open = (startWithForm = false) => {
    fixture.componentRef.setInput('startWithForm', startWithForm);
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    store = createStore();
    confirmation = { confirm: vi.fn().mockResolvedValue(true) };

    await TestBed.configureTestingModule({
      imports: [MyAddressesModal],
      providers: [
        provideTranslateService(),
        providePrimeNG(),
        { provide: AddressStore, useValue: store },
        { provide: ConfirmationDialogService, useValue: confirmation },
        { provide: GoogleMapsLoader, useValue: { load: () => new Promise<void>(() => undefined) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(MyAddressesModal);
    fixture.detectChanges();
  });

  it('loads the addresses when it opens', () => {
    open();

    expect(store.load).toHaveBeenCalledTimes(1);
  });

  it('renders an item per address', () => {
    store.groupedItems.set([giza, cairo]);

    open();

    expect(items()).toHaveLength(2);
  });

  it('opens the form directly when asked to', () => {
    open(true);

    expect(modal().showForm()).toBe(true);
    expect(items()).toHaveLength(0);
  });

  it('switches to the form for adding and for editing', () => {
    open();

    modal().openAdd();
    expect(modal().showForm()).toBe(true);
    expect(modal().editing()).toBeNull();

    modal().openEdit(giza);
    expect(modal().editing()).toEqual(giza);
  });

  it('creates an address and closes, forcing primary for the first one', async () => {
    open();
    modal().openAdd();

    await modal().onSave(DRAFT);

    expect(store.add).toHaveBeenCalledWith(toAddressRequest(DRAFT, true));
    expect(fixture.componentInstance.visible()).toBe(false);
  });

  it('updates the edited address and closes', async () => {
    open();
    modal().openEdit(giza);

    await modal().onSave(DRAFT);

    expect(store.update).toHaveBeenCalledWith('a1', toUpdateRequest(DRAFT));
    expect(fixture.componentInstance.visible()).toBe(false);
  });

  it('stays open when saving fails', async () => {
    store.add.mockResolvedValue(false);
    open();
    modal().openAdd();

    await modal().onSave(DRAFT);

    expect(fixture.componentInstance.visible()).toBe(true);
  });

  it('removes an address after confirmation', async () => {
    open();

    await modal().onRemove('a1');

    expect(confirmation.confirm).toHaveBeenCalled();
    expect(store.remove).toHaveBeenCalledWith('a1');
  });

  it('keeps the address when the deletion is cancelled', async () => {
    confirmation.confirm.mockResolvedValue(false);
    open();

    await modal().onRemove('a1');

    expect(store.remove).not.toHaveBeenCalled();
  });

  it('ignores close requests while saving', () => {
    open();
    store.saving.set(true);

    modal().onDialogVisibleChange(false);

    expect(fixture.componentInstance.visible()).toBe(true);
  });

  it('closes when the dialog asks to close', () => {
    open();

    modal().onDialogVisibleChange(false);

    expect(fixture.componentInstance.visible()).toBe(false);
  });
});
