import { computed, DeferBlockBehavior, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeAddressLike } from '../../../../shared/utils/testing/address.fixtures';
import { CheckoutSteps } from '../../components/checkout-steps/checkout-steps';
import { CHECKOUT_ROUTES } from '../../constants/checkout.routes';
import { AddressLike } from '../../interfaces/address.model/address.types';
import { AddressStore } from '../../stores/address/address.store';
import { ShippingAddress } from './shipping-address';

interface Internals {
  addressesOpen(): boolean;
  startWithForm(): boolean;
}

const createStore = () => {
  const items = signal<AddressLike[]>([]);
  const selectedId = signal<string | null>(null);

  return {
    items,
    selectedId,
    loading: signal(false),
    count: computed(() => items().length),
    selectedAddress: computed(() => items().find((a) => a.id === selectedId()) ?? null),
    load: vi.fn().mockResolvedValue(true),
    select: vi.fn((id: string) => selectedId.set(id)),
  };
};

describe('ShippingAddress', () => {
  const giza = makeAddressLike({ id: 'a1', city: 'Giza' });
  const cairo = makeAddressLike({
    id: 'a2',
    city: 'Cairo',
    street: '14 Omar Ibn Alkhattab St',
    phone: '+201112345678',
  });

  let fixture: ComponentFixture<ShippingAddress>;
  let store: ReturnType<typeof createStore>;

  const render = (items: AddressLike[] = [], selectedId: string | null = null) => {
    store.items.set(items);
    store.selectedId.set(selectedId);
    fixture.detectChanges();
  };

  const cards = () =>
    Array.from(fixture.nativeElement.querySelectorAll('[role="radio"]')) as HTMLElement[];
  const byTestId = (id: string) => fixture.debugElement.query(By.css(`[data-testid="${id}"]`));
  const page = () => fixture.componentInstance as unknown as Internals;

  beforeEach(() => {
    store = createStore();

    TestBed.configureTestingModule({
      imports: [ShippingAddress],
      deferBlockBehavior: DeferBlockBehavior.Manual,
      providers: [
        provideTranslateService(),
        provideRouter([]),
        { provide: AddressStore, useValue: store },
      ],
    });

    fixture = TestBed.createComponent(ShippingAddress);
  });

  it('loads the addresses on creation', () => {
    render();

    expect(store.load).toHaveBeenCalledTimes(1);
  });

  it('highlights step 1 in the progress bar', () => {
    render();

    const steps = fixture.debugElement.query(By.directive(CheckoutSteps));
    expect(steps.componentInstance.currentStep()).toBe(1);
  });

  it('renders a card per address with its city, street and phone', () => {
    render([giza, cairo]);

    expect(cards()).toHaveLength(2);
    expect(cards()[0].textContent).toContain('Giza');
    expect(cards()[0].textContent).toContain('21 Ahmad Mohamed St');
    expect(cards()[0].textContent).toContain('+201012346578');
  });

  it('marks only the selected card as checked and styles it', () => {
    render([giza, cairo], 'a2');

    expect(cards().map((c) => c.getAttribute('aria-checked'))).toEqual(['false', 'true']);
    expect(cards()[1].classList).toContain('bg-[#A6252A]');
    expect(cards()[1].classList).toContain('text-white');
    expect(cards()[0].classList).not.toContain('text-white');
  });

  it('selects an address when its card is clicked', () => {
    render([giza, cairo], 'a2');

    cards()[0].click();
    fixture.detectChanges();

    expect(store.select).toHaveBeenCalledWith('a1');
    expect(cards()[0].getAttribute('aria-checked')).toBe('true');
  });

  it('moves the selection with the arrow keys', () => {
    render([giza, cairo], 'a1');
    const group = fixture.nativeElement.querySelector('[role="radiogroup"]') as HTMLElement;

    group.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

    expect(store.select).toHaveBeenCalledWith('a2');
  });

  it('shows the OR divider, the add button and Next when there are addresses', () => {
    render([giza], 'a1');

    expect(fixture.nativeElement.querySelector('[role="separator"]')).not.toBeNull();
    expect(byTestId('add-address')).not.toBeNull();
    expect(byTestId('next')).not.toBeNull();
  });

  it('shows only the empty message and the add button without addresses', () => {
    render([]);

    expect(cards()).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('[role="separator"]')).toBeNull();
    expect(byTestId('next')).toBeNull();
    expect(byTestId('add-address')).not.toBeNull();
  });

  it('shows skeleton rows while loading with no addresses', () => {
    store.loading.set(true);
    render([]);

    expect(fixture.nativeElement.querySelectorAll('[data-testid="skeleton"]')).toHaveLength(3);
    expect(byTestId('add-address')).toBeNull();
  });

  it('opens the addresses popup on the list when addresses exist', () => {
    render([giza], 'a1');

    byTestId('add-address').triggerEventHandler('clicked', null);

    expect(page().addressesOpen()).toBe(true);
    expect(page().startWithForm()).toBe(false);
  });

  it('opens the popup straight on the form when there are no addresses', () => {
    render([]);

    byTestId('add-address').triggerEventHandler('clicked', null);

    expect(page().addressesOpen()).toBe(true);
    expect(page().startWithForm()).toBe(true);
  });

  it('navigates to the payment step when Next is clicked', () => {
    const navigate = vi
      .spyOn(TestBed.inject(Router), 'navigateByUrl')
      .mockResolvedValue(true);
    render([giza, cairo], 'a2');

    (byTestId('next').nativeElement as HTMLButtonElement).click();

    expect(navigate).toHaveBeenCalledWith(CHECKOUT_ROUTES.payment);
  });
});
