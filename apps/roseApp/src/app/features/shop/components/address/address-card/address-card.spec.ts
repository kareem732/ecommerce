import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AddressCard } from './address-card';

const ADDRESS = { id: 'a1', city: 'Cairo', street: '14 Omar Ibn Alkhatab St', phone: '+201012345678' };

describe('AddressCard', () => {
  let fixture: ComponentFixture<AddressCard>;
  let button: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AddressCard] }).compileComponents();
    fixture = TestBed.createComponent(AddressCard);
    fixture.componentRef.setInput('address', ADDRESS);
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector('button');
  });

  it('renders city, street and phone', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Cairo');
    expect(text).toContain('14 Omar Ibn Alkhatab St');
    expect(text).toContain('+201012345678');
  });

  it('reflects selected state via aria-checked', () => {
    expect(button.getAttribute('aria-checked')).toBe('false');
    fixture.componentRef.setInput('selected', true);
    fixture.detectChanges();
    expect(button.getAttribute('aria-checked')).toBe('true');
  });

  it('emits the address id on click', () => {
    const spy = vi.fn();
    fixture.componentInstance.picked.subscribe(spy);
    button.click();
    expect(spy).toHaveBeenCalledWith('a1');
  });
});
