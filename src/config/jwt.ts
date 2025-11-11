import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';

import env from './env';
import type { UserRole } from '../database/models/user.model';

export interface AccessTokenPayload extends jwt.JwtPayload {
  sub: string;
  role: UserRole;
  type: 'access';
}

export interface RefreshTokenPayload extends jwt.JwtPayload {
  sub: string;
  role: UserRole;
  type: 'refresh';
  jti: string;
}

const ensureSecret = (secret: string, name: 'access' | 'refresh'): Secret => {
  if (!secret) {
    throw new Error(`Missing JWT ${name} secret`);
  }

  return secret;
};

const accessSecret = ensureSecret(env.jwt.accessSecret, 'access');
const refreshSecret = ensureSecret(env.jwt.refreshSecret, 'refresh');

const accessTokenExpiry = env.jwt.accessExpiration as NonNullable<SignOptions['expiresIn']>;
const refreshTokenExpiry = env.jwt.refreshExpiration as NonNullable<SignOptions['expiresIn']>;

export const signAccessToken = (userId: string, role: UserRole) => {
  const payload: AccessTokenPayload = {
    sub: userId,
    role,
    type: 'access',
  };

  return jwt.sign(payload, accessSecret, { expiresIn: accessTokenExpiry });
};

export const signRefreshToken = (userId: string, role: UserRole, jti: string) => {
  const payload: RefreshTokenPayload = {
    sub: userId,
    role,
    type: 'refresh',
    jti,
  };

  return jwt.sign(payload, refreshSecret, { expiresIn: refreshTokenExpiry });
};

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, accessSecret) as AccessTokenPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, refreshSecret) as RefreshTokenPayload;

