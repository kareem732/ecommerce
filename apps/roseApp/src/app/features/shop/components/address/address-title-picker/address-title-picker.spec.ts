import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { AddressTitlePicker } from './address-title-picker';

describe('AddressTitlePicker', () => {
  let fixture: ComponentFixture<AddressTitlePicker>;

  const radios = () =>
    Array.from(fixture.nativeElement.querySelectorAll('[role="radio"]')) as HTMLElement[];
  const group = () => fixture.nativeElement.querySelector('[role="radiogroup"]') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressTitlePicker],
      providers: [provideTranslateService()],
    }).compileComponents();
    fixture = TestBed.createComponent(AddressTitlePicker);
    fixture.detectChanges();
  });

  it('renders Home, Work and Family in order', () => {
    expect(radios().map((r) => r.dataset['testid'])).toEqual([
      'title-Home',
      'title-Work',
      'title-Family',
    ]);
  });

  it('selects Home by default', () => {
    expect(radios().map((r) => r.getAttribute('aria-checked'))).toEqual([
      'true',
      'false',
      'false',
    ]);
  });

  it('reflects the value input', () => {
    fixture.componentRef.setInput('value', 'Family');
    fixture.detectChanges();

    expect(radios().map((r) => r.getAttribute('aria-checked'))).toEqual([
      'false',
      'false',
      'true',
    ]);
  });

  it('updates the value when an option is clicked', () => {
    radios()[1].click();

    expect(fixture.componentInstance.value()).toBe('Work');
  });

  it('moves the selection with the arrow keys and wraps around', () => {
    group().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(fixture.componentInstance.value()).toBe('Work');

    fixture.componentRef.setInput('value', 'Family');
    group().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(fixture.componentInstance.value()).toBe('Home');
  });

  it('only keeps the selected option in the tab order', () => {
    fixture.componentRef.setInput('value', 'Work');
    fixture.detectChanges();

    expect(radios().map((r) => r.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
  });

  it('keeps the first option tabbable when the value is a custom title', () => {
    fixture.componentRef.setInput('value', 'Gym');
    fixture.detectChanges();

    expect(radios().map((r) => r.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
  });
});
