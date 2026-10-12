import { HttpErrorResponse } from '@angular/common/http';
import { AuthError, AuthErrorCode } from '../models/auth-error.model';

const DEFAULT_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: 'Invalid username or password.',
  VALIDATION_ERROR: 'Some of the submitted data is invalid.',
  UNAUTHORIZED: 'Your session has expired. Please sign in again.',
  FORBIDDEN: 'You do not have permission to do this.',
  NOT_FOUND: 'The requested resource was not found.',
  CONFLICT: 'This data already exists.',
  SERVER_ERROR: 'Something went wrong on our side. Please try again later.',
  NETWORK_ERROR: 'Unable to reach the server. Check your connection.',
  UNKNOWN: 'Something went wrong.',
};

function codeFromStatus(status: number): AuthErrorCode {
  if (status === 0) return 'NETWORK_ERROR';
  if (status === 400 || status === 422) return 'VALIDATION_ERROR';
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'CONFLICT';
  if (status >= 500) return 'SERVER_ERROR';
  return 'UNKNOWN';
}

function serverMessage(error: HttpErrorResponse): string | null {
  const message = error.error?.message;
  if (typeof message === 'string' && message.trim()) return message;
  if (Array.isArray(message) && message.length) return message.join(', ');
  return null;
}

export function mapToAuthError(error: unknown): AuthError {
  if (!(error instanceof HttpErrorResponse)) {
    return {
      code: 'UNKNOWN',
      status: 0,
      message: error instanceof Error ? error.message : DEFAULT_MESSAGES.UNKNOWN,
    };
  }

  const code = codeFromStatus(error.status);
  return {
    code,
    status: error.status,
    message: serverMessage(error) ?? DEFAULT_MESSAGES[code],
  };
}
