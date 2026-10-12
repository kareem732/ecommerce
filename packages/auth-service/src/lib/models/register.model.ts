import { AuthUser, Gender } from './user.model';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  gender: Gender;
}

export interface AuthPayload {
  user: AuthUser;
  token: string;
}
