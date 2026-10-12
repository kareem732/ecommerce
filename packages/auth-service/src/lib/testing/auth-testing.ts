import { AUTH_CONFIG, AuthConfig, DEFAULT_AUTH_CONFIG } from '../config/auth.config';
import { AuthUser } from '../models/user.model';
import { TokenPayload } from '../models/token.model';

export const TEST_API_URL = 'https://api.test';

export const TEST_CONFIG: AuthConfig = {
  apiUrl: TEST_API_URL,
  ...DEFAULT_AUTH_CONFIG,
};

export const TEST_USER: AuthUser = {
  id: 'user-1',
  username: 'tester',
  email: 'tester@example.com',
  phone: null,
  firstName: 'Test',
  lastName: 'User',
  gender: 'MALE',
  emailVerified: true,
  phoneVerified: false,
  role: 'USER',
};

export const provideAuthConfigForTests = () => ({
  provide: AUTH_CONFIG,
  useValue: TEST_CONFIG,
});

export function makeJwt(overrides: Partial<TokenPayload> = {}, expiresInSeconds = 3600): string {
  const now = Math.floor(Date.now() / 1000);
  const body = { userId: 'user-1', role: 'USER', iat: now, exp: now + expiresInSeconds, ...overrides };
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(body)}.signature`;
}
