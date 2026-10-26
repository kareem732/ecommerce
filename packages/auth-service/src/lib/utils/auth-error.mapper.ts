import { HttpErrorResponse } from '@angular/common/http';
import { AuthError, AuthErrorCode } from '../models/auth-error.model';

const DEFAULT_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: 'Invalid username or password.',
  VALIDATION_ERROR: 'Some of the submitted data is invalid.',
  UNAUTHORIZED: 'Your session has expired. Please sign in again.',
  FORBIDDEN: 'You do not have permission to do this.',
  NOT_FOUND: 'The requested resource was not found.',
  CONFLICT: 'This data already exists.',
  TOO_MANY_REQUESTS: 'Too many requests. Please wait a moment and try again.',
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
  if (status === 429) return 'TOO_MANY_REQUESTS';
  if (status >= 500) return 'SERVER_ERROR';
  return 'UNKNOWN';
}

function isCleanMessage(msg: string): boolean {
  const trimmed = msg.trim();
  if (!trimmed) return false;
  // Ignore HTML responses (e.g. 502/504 Bad Gateway from proxy)
  if (trimmed.startsWith('<') || trimmed.includes('<!DOCTYPE') || trimmed.includes('<html')) return false;
  // Ignore stack traces
  if (trimmed.includes('    at ') || trimmed.includes('\nat ') || trimmed.includes('node:internal')) return false;
  // Ignore raw JSON string dumps
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return false;
  return true;
}

function extractFromErrors(errors: unknown): string | null {
  if (Array.isArray(errors)) {
    const valid = errors
      .map((e) => (typeof e === 'string' ? e : typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : ''))
      .filter(isCleanMessage);
    if (valid.length) return valid.join(', ');
  }
  if (errors && typeof errors === 'object') {
    const values: string[] = [];
    for (const val of Object.values(errors)) {
      if (typeof val === 'string' && isCleanMessage(val)) {
        values.push(val);
      } else if (Array.isArray(val)) {
        for (const item of val) {
          if (typeof item === 'string' && isCleanMessage(item)) {
            values.push(item);
          }
        }
      }
    }
    if (values.length) return values.join(', ');
  }
  return null;
}

export function serverMessage(error: HttpErrorResponse): string | null {
  if (!error.error) return null;

  if (typeof error.error === 'string') {
    return isCleanMessage(error.error) ? error.error.trim() : null;
  }

  if (typeof error.error === 'object') {
    const message = error.error.message;
    if (typeof message === 'string' && isCleanMessage(message)) return message.trim();
    if (Array.isArray(message)) {
      const valid = message.filter((m) => typeof m === 'string' && isCleanMessage(m));
      if (valid.length) return valid.join(', ');
    }

    const errField = error.error.error;
    if (typeof errField === 'string' && isCleanMessage(errField)) return errField.trim();

    const fromErrors = extractFromErrors(error.error.errors);
    if (fromErrors) return fromErrors;
  }

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
