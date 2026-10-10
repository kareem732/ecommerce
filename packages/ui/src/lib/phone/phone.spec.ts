import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Phone } from './phone';

describe('Phone', () => {
  let fixture: ComponentFixture<Phone>;
  const root = () => fixture.nativeElement as HTMLElement;
  const telInput = () =>
    root().querySelector('input[type="tel"]') as HTMLInputElement;
  const countryBtn = () =>
    root().querySelector('.phone__country') as HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Phone],
    }).compileComponents();
    fixture = TestBed.createComponent(Phone);
    fixture.detectChanges();
  });

  it('uses Egypt as the default country', () => {
    expect(fixture.componentInstance.activeCode()).toBe('EG');
    expect(fixture.componentInstance.activeCountry().dial).toBe('20');
  });

  it('respects a custom default country', () => {
    fixture.componentRef.setInput('defaultCountry', 'US');
    expect(fixture.componentInstance.activeCode()).toBe('US');
  });

  it('writeValue parses an international number', () => {
    fixture.componentInstance.writeValue('+201012345678');
    expect(fixture.componentInstance.country()).toBe('EG');
    expect(fixture.componentInstance.national()).toBe('1012345678');
  });

  it('writeValue with an empty value clears the number', () => {
    fixture.componentInstance.writeValue('+201012345678');
    fixture.componentInstance.writeValue(null);
    expect(fixture.componentInstance.national()).toBe('');
  });

  it('keeps digits only and emits the full number', () => {
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    telInput().value = '10-12ab34';
    telInput().dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.national()).toBe('101234');
    expect(onChange).toHaveBeenCalledWith('+20101234');
  });

  it('emits an empty string when the number is cleared', () => {
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    telInput().value = '';
    telInput().dispatchEvent(new Event('input'));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('opens the menu and lists countries', () => {
    countryBtn().click();
    fixture.detectChanges();
    expect(root().querySelectorAll('.phone__option').length).toBeGreaterThan(
      100,
    );
  });

  it('filters countries by name, code or dial code', () => {
    fixture.componentInstance.search.set('egypt');
    expect(
      fixture.componentInstance.filtered().some((c) => c.code === 'EG'),
    ).toBe(true);
    fixture.componentInstance.search.set('+44');
    expect(
      fixture.componentInstance.filtered().some((c) => c.code === 'GB'),
    ).toBe(true);
    fixture.componentInstance.search.set('zzzzzz');
    expect(fixture.componentInstance.filtered()).toHaveLength(0);
  });

  it('picks a country, closes the menu and re-emits', () => {
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    fixture.componentInstance.national.set('5551234');
    const us = fixture.componentInstance.countries.find(
      (c) => c.code === 'US',
    )!;
    fixture.componentInstance.open.set(true);
    fixture.componentInstance.pick(us);
    expect(fixture.componentInstance.open()).toBe(false);
    expect(onChange).toHaveBeenCalledWith('+15551234');
  });

  it('closes on Escape and on outside click', () => {
    fixture.componentInstance.open.set(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(fixture.componentInstance.open()).toBe(false);

    fixture.componentInstance.open.set(true);
    document.body.click();
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('does not toggle when disabled', () => {
    fixture.componentInstance.setDisabledState(true);
    fixture.componentInstance.toggle();
    expect(fixture.componentInstance.open()).toBe(false);
  });
});
