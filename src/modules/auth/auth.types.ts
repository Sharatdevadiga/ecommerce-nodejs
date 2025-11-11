import type { UserAttributes } from '../../database/models/user.model';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserAttributes['role'];
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

