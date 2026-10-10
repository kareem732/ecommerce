export interface ForgotPasswordRequest {
  email: string;
  redirectUrl: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
