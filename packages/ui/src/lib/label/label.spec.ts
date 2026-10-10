import { Label } from './label';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('Label', () => {
  let fixture: ComponentFixture<Label>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Label],
    }).compileComponents();
    fixture = TestBed.createComponent(Label);
  });

  it('renders the text', () => {
    fixture.componentRef.setInput('text', 'Email');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Email');
  });

  it('shows the required mark', () => {
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.label__required'),
    ).toBeTruthy();
  });

  it('sets the for attribute', () => {
    fixture.componentRef.setInput('for', 'email');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('label').getAttribute('for'),
    ).toBe('email');
  });
});
