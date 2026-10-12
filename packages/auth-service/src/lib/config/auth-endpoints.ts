export const AUTH_ENDPOINTS = {
  sendEmailVerification: '/api/auth/send-email-verification',
  confirmEmailVerification: '/api/auth/confirm-email-verification',
  register: '/api/auth/register',
  login: '/api/auth/login',
  forgotPassword: '/api/auth/forgot-password',
  resetPassword: '/api/auth/reset-password',
} as const;

export function isAuthEndpoint(url: string): boolean {
  const path = url.split('?')[0];
  return Object.values(AUTH_ENDPOINTS).some((endpoint) => path.endsWith(endpoint));
}
