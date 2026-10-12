import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Textarea } from './textarea';

describe('Textarea', () => {
  let fixture: ComponentFixture<Textarea>;
  const root = () => fixture.nativeElement as HTMLElement;
  const area = () => root().querySelector('textarea') as HTMLTextAreaElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Textarea],
    }).compileComponents();
    fixture = TestBed.createComponent(Textarea);
    fixture.detectChanges();
  });

  it('renders label, placeholder and rows', () => {
    fixture.componentRef.setInput('label', 'Message');
    fixture.componentRef.setInput('placeholder', 'Write here');
    fixture.componentRef.setInput('rows', 6);
    fixture.detectChanges();
    expect(root().querySelector('.field__label')?.textContent).toContain(
      'Message',
    );
    expect(area().placeholder).toBe('Write here');
    expect(area().rows).toBe(6);
  });

  it('writeValue updates the textarea', () => {
    fixture.componentInstance.writeValue('text');
    fixture.detectChanges();
    expect(area().value).toBe('text');
  });

  it('calls onChange when typing', () => {
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    area().value = 'new';
    area().dispatchEvent(new Event('input'));
    expect(onChange).toHaveBeenCalledWith('new');
  });

  it('calls onTouched on blur', () => {
    const onTouched = jest.fn();
    fixture.componentInstance.registerOnTouched(onTouched);
    area().dispatchEvent(new Event('blur'));
    expect(onTouched).toHaveBeenCalled();
  });

  it('shows the error', () => {
    fixture.componentRef.setInput('error', 'Too short');
    fixture.detectChanges();
    expect(root().querySelector('.field__error')?.textContent).toContain(
      'Too short',
    );
  });

  it('is disabled from the form', () => {
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    expect(area().disabled).toBe(true);
  });
});
