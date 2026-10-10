import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Button } from './button';

describe('Button', () => {
  let fixture: ComponentFixture<Button>;
  const root = () => fixture.nativeElement as HTMLElement;
  const btn = () => root().querySelector('button') as HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Button],
    }).compileComponents();
    fixture = TestBed.createComponent(Button);
    fixture.componentRef.setInput('label', 'Save');
    fixture.detectChanges();
  });

  it('renders the label', () => {
    expect(btn().textContent).toContain('Save');
  });

  it('uses primary variant and type button by default', () => {
    expect(btn().classList).toContain('btn--primary');
    expect(btn().type).toBe('button');
  });

  it('applies the variant and fullWidth classes', () => {
    fixture.componentRef.setInput('variant', 'danger');
    fixture.componentRef.setInput('fullWidth', true);
    fixture.detectChanges();
    expect(btn().classList).toContain('btn--danger');
    expect(btn().classList).toContain('btn--full');
  });

  it('emits clicked on click', () => {
    const spy = jest.fn();
    fixture.componentInstance.clicked.subscribe(spy);
    btn().click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('is disabled and shows a spinner while loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(btn().disabled).toBe(true);
    expect(root().querySelector('.pi-spinner')).not.toBeNull();
  });

  it('does not emit when disabled', () => {
    const spy = jest.fn();
    fixture.componentInstance.clicked.subscribe(spy);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    fixture.componentInstance.onClick(new MouseEvent('click'));
    expect(btn().disabled).toBe(true);
    expect(spy).not.toHaveBeenCalled();
  });

  it('renders the icon when provided', () => {
    fixture.componentRef.setInput('icon', 'pi pi-check');
    fixture.detectChanges();
    expect(root().querySelector('i.pi-check')).not.toBeNull();
  });
});
