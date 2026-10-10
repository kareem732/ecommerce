import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Select } from './select';
import { SelectOption } from './select.types';
const OPTIONS: SelectOption[] = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma', disabled: true },
];

describe('Select', () => {
  let fixture: ComponentFixture<Select>;
  const root = () => fixture.nativeElement as HTMLElement;
  const trigger = () =>
    root().querySelector('.select__trigger') as HTMLButtonElement;
  const optionButtons = () =>
    Array.from(
      root().querySelectorAll('.select__option'),
    ) as HTMLButtonElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Select],
    }).compileComponents();
    fixture = TestBed.createComponent(Select);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
  });

  it('shows the placeholder when nothing is selected', () => {
    expect(root().querySelector('.select__value')?.textContent).toContain(
      'Select an option',
    );
  });

  it('opens the menu on click', () => {
    trigger().click();
    fixture.detectChanges();
    expect(optionButtons()).toHaveLength(3);
  });

  it('selects an option, emits and closes', () => {
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    trigger().click();
    fixture.detectChanges();
    optionButtons()[1].click();
    fixture.detectChanges();
    expect(onChange).toHaveBeenCalledWith('b');
    expect(root().querySelector('.select__menu')).toBeNull();
    expect(root().querySelector('.select__value')?.textContent).toContain(
      'Beta',
    );
  });

  it('ignores disabled options', () => {
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    fixture.componentInstance.select(OPTIONS[2]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('writeValue shows the matching label', () => {
    fixture.componentInstance.writeValue('a');
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedLabel()).toBe('Alpha');
  });

  it('closes on Escape', () => {
    trigger().click();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('closes on outside click and marks touched', () => {
    const onTouched = jest.fn();
    fixture.componentInstance.registerOnTouched(onTouched);
    trigger().click();
    fixture.detectChanges();
    document.body.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(false);
    expect(onTouched).toHaveBeenCalled();
  });

  it('does not open when disabled', () => {
    fixture.componentInstance.setDisabledState(true);
    fixture.componentInstance.toggle();
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('shows the empty state when there are no options', () => {
    fixture.componentRef.setInput('options', []);
    trigger().click();
    fixture.detectChanges();
    expect(root().querySelector('.select__empty')).not.toBeNull();
  });
});
