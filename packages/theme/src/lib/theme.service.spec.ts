import { TestBed } from '@angular/core/testing';
import { THEME_STORAGE_KEY, ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  function create(): ThemeService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    return TestBed.inject(ThemeService);
  }

  it('uses the saved theme from localStorage', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    expect(create().theme()).toBe('dark');
  });

  it('falls back to light when nothing is saved and the system is light', () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: false }) as never;
    expect(create().theme()).toBe('light');
  });

  it('uses dark when the system prefers dark and nothing is saved', () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: true }) as never;
    expect(create().theme()).toBe('dark');
  });

  it('toggles between light and dark', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    const service = create();
    service.toggle();
    expect(service.theme()).toBe('dark');
    service.toggle();
    expect(service.theme()).toBe('light');
  });

  it('applies the class on <html> and persists the choice', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    const service = create();
    service.set('dark');
    TestBed.tick();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('switches back to light', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    const service = create();
    service.set('light');
    TestBed.tick();
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
