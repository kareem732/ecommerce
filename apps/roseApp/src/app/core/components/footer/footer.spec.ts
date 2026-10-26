import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { Footer } from './footer';
import { FooterService } from './footer.service';

describe('Footer', () => {
  let fixture: ComponentFixture<Footer>;
  let component: Footer;
  let mockFooterService: { subscriptionEmail: ReturnType<typeof vi.fn>; subscribe?: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockFooterService = {
      subscriptionEmail: vi.fn().mockReturnValue(of({ message: 'Success' })),
    };

    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [
        provideRouter([{ path: '**', component: class Dummy {} }]),
        provideTranslateService(),
        { provide: FooterService, useValue: mockFooterService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('renders the Rose logo and application copyright', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const logoImg = compiled.querySelector('img[alt="Rose"]') as HTMLImageElement;
    expect(logoImg).toBeTruthy();
    expect(logoImg.src).toContain('bb70dbdbb3472a27ffcc4d3baeb8eaceb3873b18.png');

    const yearText = compiled.textContent;
    expect(yearText).toContain(String(component.currentYear));
  });

  it('renders all navigation links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('nav ul li a');
    expect(links.length).toBe(component.navLinks.length);
  });

  it('subscribes with customer@example.com on newsletter submission', () => {
    component.email.set('customer@example.com');
    const compiled = fixture.nativeElement as HTMLElement;
    const form = compiled.querySelector('form') as HTMLFormElement;

    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(mockFooterService.subscriptionEmail).toHaveBeenCalledWith({ email: 'customer@example.com' });
    expect(component.isSubscribed()).toBe(true);
    expect(component.emailError()).toBeNull();
  });

  it('handles subscription error on failure', () => {
    component.email.set('customer@example.com');
    mockFooterService.subscriptionEmail.mockReturnValue(throwError(() => new Error('API Error')));
    const compiled = fixture.nativeElement as HTMLElement;
    const form = compiled.querySelector('form') as HTMLFormElement;

    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(mockFooterService.subscriptionEmail).toHaveBeenCalledWith({ email: 'customer@example.com' });
    expect(component.isSubscribed()).toBe(false);
    expect(component.emailError()).toBe('FOOTER.INVALID_EMAIL');
  });

  it('uses semantic theme tokens for background, border, and Rose accent', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const footerEl = compiled.querySelector('footer');
    expect(footerEl?.className).toContain('bg-[var(--bg-footer)]');
    expect(footerEl?.className).toContain('border-[var(--border-footer)]');

    const appTitleEl = compiled.querySelector('h3');
    expect(appTitleEl?.className).toContain('text-[var(--color-rose-accent)]');
  });
});
