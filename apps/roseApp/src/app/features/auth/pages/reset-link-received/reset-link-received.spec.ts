import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { ResetLinkReceived } from './reset-link-received';

describe('ResetLinkReceived', () => {
  async function setup(state: Record<string, unknown> | null) {
    history.replaceState(state, '');

    await TestBed.configureTestingModule({
      imports: [ResetLinkReceived],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const fixture = TestBed.createComponent(ResetLinkReceived);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance, navigate };
  }

  afterEach(() => {
    history.replaceState(null, '');
  });

  it('should create', async () => {
    const { component } = await setup({ email: 'user@example.com' });
    expect(component).toBeTruthy();
  });

  it('reads the email from history state and trims it', async () => {
    const { component } = await setup({ email: '  user@example.com  ' });
    expect(component.email()).toBe('user@example.com');
  });

  it('displays the email in the page', async () => {
    const { fixture } = await setup({ email: 'user@example.com' });
    expect(fixture.nativeElement.textContent).toContain('user@example.com');
  });

  it('does not redirect when an email is present', async () => {
    const { navigate } = await setup({ email: 'user@example.com' });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('redirects to forget-password when there is no email', async () => {
    const { component, navigate } = await setup(null);
    expect(component.email()).toBe('');
    expect(navigate).toHaveBeenCalledWith(['../forget-password'], {
      relativeTo: expect.anything(),
    });
  });

  it('renders the back link and the contact link', async () => {
    const { fixture } = await setup({ email: 'user@example.com' });
    expect(fixture.nativeElement.querySelectorAll('a').length).toBe(2);
  });
});
