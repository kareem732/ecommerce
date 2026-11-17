import { AuthUser } from '@org/auth-service';

export interface UserProfile extends AuthUser {
  photo: string | null;
  updatedAt?: string;
}

export interface ProfilePayload {
  user: UserProfile;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone: string;
  photo?: string;
}

export interface UploadPayload {
  url: string;
}

export interface ProfileUpdate {
  changes: UpdateProfileRequest;
  photo: File | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
