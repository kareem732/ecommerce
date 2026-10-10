import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Input } from './input';

describe('Input', () => {
  let fixture: ComponentFixture<Input>;
  const root = () => fixture.nativeElement as HTMLElement;
  const field = () => root().querySelector('input') as HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Input],
    }).compileComponents();
    fixture = TestBed.createComponent(Input);
    fixture.detectChanges();
  });

  it('renders label and placeholder', () => {
    fixture.componentRef.setInput('label', 'Email');
    fixture.componentRef.setInput('placeholder', 'you@mail.com');
    fixture.detectChanges();
    expect(root().querySelector('.field__label')?.textContent).toContain(
      'Email',
    );
    expect(field().placeholder).toBe('you@mail.com');
  });

  it('writeValue updates the input', () => {
    fixture.componentInstance.writeValue('abc');
    fixture.detectChanges();
    expect(field().value).toBe('abc');
    fixture.componentInstance.writeValue(null);
    fixture.detectChanges();
    expect(field().value).toBe('');
  });

  it('calls onChange when the user types', () => {
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    field().value = 'hello';
    field().dispatchEvent(new Event('input'));
    expect(onChange).toHaveBeenCalledWith('hello');
  });

  it('calls onTouched on blur', () => {
    const onTouched = jest.fn();
    fixture.componentInstance.registerOnTouched(onTouched);
    field().dispatchEvent(new Event('blur'));
    expect(onTouched).toHaveBeenCalled();
  });

  it('shows the error and error class', () => {
    fixture.componentRef.setInput('error', 'Invalid');
    fixture.detectChanges();
    expect(root().querySelector('.field__error')?.textContent).toContain(
      'Invalid',
    );
    expect(root().querySelector('.field')?.classList).toContain('field--error');
  });

  it('disables via the input or via the form', () => {
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    expect(field().disabled).toBe(true);
  });

  it('toggles password visibility', () => {
    fixture.componentRef.setInput('type', 'password');
    fixture.detectChanges();
    expect(field().type).toBe('password');
    (root().querySelector('.field__toggle') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(field().type).toBe('text');
  });

  it('has no toggle button for non-password types', () => {
    expect(root().querySelector('.field__toggle')).toBeNull();
  });
});
