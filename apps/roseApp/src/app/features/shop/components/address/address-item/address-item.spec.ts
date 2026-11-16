import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeAddressLike } from '../../../../../shared/utils/testing/address.fixtures';
import { AddressItem } from './address-item';

describe('AddressItem', () => {
  const address = makeAddressLike({ id: 'a1', title: 'Work' });
  let fixture: ComponentFixture<AddressItem>;

  const byTestId = (id: string) =>
    fixture.nativeElement.querySelector(`[data-testid="${id}"]`) as HTMLButtonElement;
  const card = () => fixture.nativeElement.querySelector('fieldset') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressItem],
      providers: [provideTranslateService()],
    }).compileComponents();
    fixture = TestBed.createComponent(AddressItem);
    fixture.componentRef.setInput('address', address);
    fixture.detectChanges();
  });

  it('shows the category, city, street and phone', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(fixture.nativeElement.querySelector('legend').textContent).toContain('Work');
    expect(text).toContain('Giza');
    expect(text).toContain('21 Ahmad Mohamed St');
    expect(text).toContain('+201012346578');
  });

  it('marks the active address', () => {
    expect(card().getAttribute('aria-current')).toBeNull();

    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();

    expect(card().getAttribute('aria-current')).toBe('true');
  });

  it('emits picked when the card is clicked', () => {
    const spy = vi.fn();
    fixture.componentInstance.picked.subscribe(spy);

    card().click();

    expect(spy).toHaveBeenCalledWith('a1');
  });

  it('emits picked from the keyboard', () => {
    const spy = vi.fn();
    fixture.componentInstance.picked.subscribe(spy);

    card().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(spy).toHaveBeenCalledWith('a1');
  });

  it('does not emit picked when active or busy', () => {
    const spy = vi.fn();
    fixture.componentInstance.picked.subscribe(spy);

    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();
    card().click();
    fixture.componentRef.setInput('active', false);
    fixture.componentRef.setInput('busy', true);
    fixture.detectChanges();
    card().click();

    expect(spy).not.toHaveBeenCalled();
  });

  it('emits edit with the address without picking it', () => {
    const edit = vi.fn();
    const picked = vi.fn();
    fixture.componentInstance.edit.subscribe(edit);
    fixture.componentInstance.picked.subscribe(picked);

    byTestId('edit').click();

    expect(edit).toHaveBeenCalledWith(address);
    expect(picked).not.toHaveBeenCalled();
  });

  it('emits remove with the id without picking it', () => {
    const remove = vi.fn();
    const picked = vi.fn();
    fixture.componentInstance.remove.subscribe(remove);
    fixture.componentInstance.picked.subscribe(picked);

    byTestId('delete').click();

    expect(remove).toHaveBeenCalledWith('a1');
    expect(picked).not.toHaveBeenCalled();
  });

  it('disables both actions while busy', () => {
    fixture.componentRef.setInput('busy', true);
    fixture.detectChanges();

    expect(byTestId('edit').disabled).toBe(true);
    expect(byTestId('delete').disabled).toBe(true);
  });
});
