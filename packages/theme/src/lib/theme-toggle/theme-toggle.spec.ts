import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeService } from '../theme.service';
import { ThemeToggle } from './theme-toggle';

describe('ThemeToggle', () => {
  let fixture: ComponentFixture<ThemeToggle>;
  let service: ThemeService;

  beforeEach(async () => {
    localStorage.setItem('theme', 'light');
    await TestBed.configureTestingModule({
      imports: [ThemeToggle],
    }).compileComponents();
    service = TestBed.inject(ThemeService);
    fixture = TestBed.createComponent(ThemeToggle);
    fixture.detectChanges();
  });

  it('switches the theme when clicked', () => {
    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();
    expect(service.theme()).toBe('dark');
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('has an accessible label', () => {
    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Switch to dark mode');
  });
});
