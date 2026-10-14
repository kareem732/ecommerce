import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { PasswordResetService } from '@org/auth-service';
import { of, throwError } from 'rxjs';
import { ResetPassword } from './reset-password';

describe('ResetPassword', () => {
  const service = { resetPassword: vi.fn() };
  const STRONG = 'Str0ng!Pass#2024';

  let fixture: ComponentFixture<ResetPassword>;
  let component: ResetPassword;

  const form = () => component['form'];
  const submit = () => component['submit']();
  const fill = (newPassword = STRONG, confirmPassword = STRONG) =>
    form().setValue({ newPassword, confirmPassword });
  const create = (token: string | null) => {
    vi
      .spyOn(TestBed.inject(ActivatedRoute).snapshot.queryParamMap, 'get')
      .mockReturnValue(token);
    fixture = TestBed.createComponent(ResetPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    service.resetPassword.mockReset();

    await TestBed.configureTestingModule({
      imports: [ResetPassword],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: PasswordResetService, useValue: service },
      ],
    }).compileComponents();
  });

  describe('without a token', () => {
    beforeEach(() => create(null));

    it('shows the invalid link message and no form', () => {
      expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('form')).toBeNull();
    });

    it('never calls the api', () => {
      submit();

      expect(service.resetPassword).not.toHaveBeenCalled();
    });
  });

  describe('with a token', () => {
    beforeEach(() => create('abc-token'));

    it('renders the form', () => {
      expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
    });

    it('does not call the api when the form is invalid', () => {
      submit();

      expect(service.resetPassword).not.toHaveBeenCalled();
      expect(form().touched).toBe(true);
    });

    it('does not call the api when the passwords do not match', () => {
      fill(STRONG, 'different');

      submit();

      expect(service.resetPassword).not.toHaveBeenCalled();
    });

    it('sends the token with both passwords', () => {
      service.resetPassword.mockReturnValue(of('done'));
      fill();

      submit();

      expect(service.resetPassword).toHaveBeenCalledWith({
        token: 'abc-token',
        newPassword: STRONG,
        confirmPassword: STRONG,
      });
    });

    it('shows the success state on success', () => {
      service.resetPassword.mockReturnValue(of('done'));
      fill();

      submit();
      fixture.detectChanges();

      expect(component['done']()).toBe(true);
      expect(component['loading']()).toBe(false);
      expect(fixture.nativeElement.querySelector('[role="status"]')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('form')).toBeNull();
    });

    it('shows the server error and stops loading on failure', () => {
      service.resetPassword.mockReturnValue(
        throwError(() => ({ code: 'VALIDATION_ERROR', status: 400, message: 'Token expired' })),
      );
      fill();

      submit();
      fixture.detectChanges();

      expect(component['done']()).toBe(false);
      expect(component['loading']()).toBe(false);
      expect(component['serverError']()).toBe('Token expired');
      expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
        'Token expired',
      );
    });
  });
});