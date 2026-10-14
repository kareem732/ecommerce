import { type MockInstance, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { LoginService } from '@org/auth-service';
import { of, throwError } from 'rxjs';
import { Login } from './login';

describe('Login', () => {
  const loginService = { login: vi.fn() };
  let fixture: ComponentFixture<Login>;
  let component: Login;
  let navigate: MockInstance;

  const form = () => component['form'];
  const fill = (remember = false) =>
    form().setValue({ username: 'ahmed', password: 'secret123', remember });
  const submit = () => component['submit']();
  const setReturnUrl = (url: string | null) =>
    vi
      .spyOn(TestBed.inject(ActivatedRoute).snapshot.queryParamMap, 'get')
      .mockReturnValue(url);

  beforeEach(async () => {
    loginService.login.mockReset();

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: LoginService, useValue: loginService },
      ],
    }).compileComponents();

    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not call the api when the form is invalid', () => {
    submit();

    expect(loginService.login).not.toHaveBeenCalled();
    expect(form().touched).toBe(true);
  });

  it('sends the credentials and the remember flag', () => {
    loginService.login.mockReturnValue(of({}));
    fill(true);

    submit();

    expect(loginService.login).toHaveBeenCalledWith(
      { username: 'ahmed', password: 'secret123' },
      true,
    );
  });

  it('trims the username', () => {
    loginService.login.mockReturnValue(of({}));
    form().setValue({ username: '  ahmed  ', password: 'secret123', remember: false });

    submit();

    expect(loginService.login).toHaveBeenCalledWith(
      { username: 'ahmed', password: 'secret123' },
      false,
    );
  });

  it('navigates home on success by default', () => {
    loginService.login.mockReturnValue(of({}));
    setReturnUrl(null);
    fill();

    submit();

    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('navigates to the returnUrl on success', () => {
    loginService.login.mockReturnValue(of({}));
    setReturnUrl('/cart');
    fill();

    submit();

    expect(navigate).toHaveBeenCalledWith('/cart');
  });

  it.each(['https://evil.com', '//evil.com'])('ignores the external returnUrl %s', (url) => {
    loginService.login.mockReturnValue(of({}));
    setReturnUrl(url);
    fill();

    submit();

    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('shows the server error and stops loading on failure', () => {
    loginService.login.mockReturnValue(
      throwError(() => ({
        code: 'INVALID_CREDENTIALS',
        status: 401,
        message: 'Invalid credentials',
      })),
    );
    fill();

    submit();
    fixture.detectChanges();

    expect(component['loading']()).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Invalid credentials');
  });
});