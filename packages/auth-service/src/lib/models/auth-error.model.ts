export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

export interface AuthError {
  code: AuthErrorCode;
  status: number;
  message: string;
}
