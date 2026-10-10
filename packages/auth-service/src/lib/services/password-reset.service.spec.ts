import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { PasswordResetService } from './password-reset.service';
import { provideAuthConfigForTests } from '../testing/auth-testing';

describe('PasswordResetService', () => {
  const api = { forgotPassword: jest.fn(), resetPassword: jest.fn() };
  let service: PasswordResetService;

  beforeEach(() => {
    jest.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [provideAuthConfigForTests(), { provide: AuthApiService, useValue: api }],
    });
    service = TestBed.inject(PasswordResetService);
  });

  it('forgotPassword sends email and redirectUrl', (done) => {
    api.forgotPassword.mockReturnValue(of('sent'));

    service.forgotPassword('e@x.com', 'https://app/reset').subscribe((message) => {
      expect(api.forgotPassword).toHaveBeenCalledWith({ email: 'e@x.com', redirectUrl: 'https://app/reset' });
      expect(message).toBe('sent');
      done();
    });
  });

  it('resetPassword forwards the request', (done) => {
    const request = { token: 't', newPassword: 'n', confirmPassword: 'n' };
    api.resetPassword.mockReturnValue(of('ok'));

    service.resetPassword(request).subscribe((message) => {
      expect(api.resetPassword).toHaveBeenCalledWith(request);
      expect(message).toBe('ok');
      done();
    });
  });
});
