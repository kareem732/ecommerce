import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Checkbox } from './checkbox';

describe('Checkbox', () => {
  let fixture: ComponentFixture<Checkbox>;
  const root = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Checkbox],
    }).compileComponents();
    fixture = TestBed.createComponent(Checkbox);
    fixture.detectChanges();
  });

  it('is unchecked by default', () => {
    expect(fixture.componentInstance.checked()).toBe(false);
  });

  it('renders the label linked to the input id', () => {
    fixture.componentRef.setInput('label', 'Accept terms');
    fixture.detectChanges();
    const label = root().querySelector('.checkbox__label') as HTMLLabelElement;
    expect(label.textContent).toContain('Accept terms');
    expect(label.getAttribute('for')).toBe(fixture.componentInstance.id);
  });

  it('does not render a label when empty', () => {
    expect(root().querySelector('.checkbox__label')).toBeNull();
  });

  it('shows the error with role alert', () => {
    fixture.componentRef.setInput('error', 'Required');
    fixture.detectChanges();
    const err = root().querySelector('.checkbox__error');
    expect(err?.textContent).toContain('Required');
    expect(err?.getAttribute('role')).toBe('alert');
  });

  it('gives each instance a unique id', () => {
    const other = TestBed.createComponent(Checkbox);
    expect(other.componentInstance.id).not.toBe(fixture.componentInstance.id);
  });
});
