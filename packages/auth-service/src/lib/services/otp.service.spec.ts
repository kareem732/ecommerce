import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { OtpService } from './otp.service';
import { provideAuthConfigForTests } from '../testing/auth-testing';

describe('OtpService', () => {
  const api = { sendEmailVerification: jest.fn(), confirmEmailVerification: jest.fn() };
  let service: OtpService;

  beforeEach(() => {
    jest.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [provideAuthConfigForTests(), { provide: AuthApiService, useValue: api }],
    });
    service = TestBed.inject(OtpService);
  });

  it('sendCode calls the api with the email', (done) => {
    api.sendEmailVerification.mockReturnValue(of('sent'));

    service.sendCode('e@x.com').subscribe((message) => {
      expect(api.sendEmailVerification).toHaveBeenCalledWith({ email: 'e@x.com' });
      expect(message).toBe('sent');
      done();
    });
  });

  it('confirmCode calls the api with the email and code', (done) => {
    api.confirmEmailVerification.mockReturnValue(of('verified'));

    service.confirmCode('e@x.com', '123456').subscribe((message) => {
      expect(api.confirmEmailVerification).toHaveBeenCalledWith({ email: 'e@x.com', code: '123456' });
      expect(message).toBe('verified');
      done();
    });
  });
});
