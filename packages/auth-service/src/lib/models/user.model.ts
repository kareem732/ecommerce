export type Gender = 'MALE' | 'FEMALE';
export type UserRole = 'USER' | 'ADMIN';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  gender: Gender;
  emailVerified: boolean;
  phoneVerified: boolean;
  role: UserRole;
  createdAt?: string;
}
