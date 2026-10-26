import { HttpErrorResponse } from '@angular/common/http';
import { mapToAuthError } from './auth-error.mapper';

const httpError = (status: number, error?: unknown) =>
  new HttpErrorResponse({ status, error, statusText: 'x' });

describe('mapToAuthError', () => {
  it.each([
    [0, 'NETWORK_ERROR'],
    [400, 'VALIDATION_ERROR'],
    [422, 'VALIDATION_ERROR'],
    [401, 'UNAUTHORIZED'],
    [403, 'FORBIDDEN'],
    [404, 'NOT_FOUND'],
    [409, 'CONFLICT'],
    [429, 'TOO_MANY_REQUESTS'],
    [500, 'SERVER_ERROR'],
    [503, 'SERVER_ERROR'],
    [418, 'UNKNOWN'],
  ])('maps status %i to %s', (status, code) => {
    expect(mapToAuthError(httpError(status)).code).toBe(code);
  });

  it('uses the server message when present', () => {
    const result = mapToAuthError(httpError(400, { message: 'Email already used' }));
    expect(result).toEqual({ code: 'VALIDATION_ERROR', status: 400, message: 'Email already used' });
  });

  it('uses error.error.error string when present', () => {
    const result = mapToAuthError(httpError(400, { error: 'Invalid credentials payload' }));
    expect(result.message).toBe('Invalid credentials payload');
  });

  it('uses error string body when present', () => {
    const result = mapToAuthError(httpError(400, 'Direct string message'));
    expect(result.message).toBe('Direct string message');
  });

  it('ignores HTML error responses and falls back to default message', () => {
    const result = mapToAuthError(httpError(502, '<html><body>502 Bad Gateway</body></html>'));
    expect(result.message).toContain('try again later');
  });

  it('joins array messages', () => {
    const result = mapToAuthError(httpError(400, { message: ['a is required', 'b is invalid'] }));
    expect(result.message).toBe('a is required, b is invalid');
  });

  it('falls back to a default message when the body has none', () => {
    expect(mapToAuthError(httpError(500)).message).toContain('try again later');
  });

  it('handles non-http errors', () => {
    expect(mapToAuthError(new Error('boom'))).toEqual({ code: 'UNKNOWN', status: 0, message: 'boom' });
    expect(mapToAuthError('weird').code).toBe('UNKNOWN');
  });
});
