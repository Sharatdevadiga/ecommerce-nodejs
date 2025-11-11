import type { RequestHandler } from 'express';

import {
  authenticateUser,
  refreshAuthTokens,
  registerUser,
  revokeRefreshToken,
  type TokenMetadata,
} from './auth.service';

const getRequestMetadata = (req: Parameters<RequestHandler>[0]): TokenMetadata => {
  const metadata: TokenMetadata = {};

  const userAgent = req.get('user-agent') ?? undefined;
  if (userAgent) {
    metadata.userAgent = userAgent;
  }

  const forwarded = req.headers['x-forwarded-for'];
  const forwardedIp =
    (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim() ?? undefined;
  const ipAddress = forwardedIp ?? req.socket.remoteAddress ?? undefined;

  if (ipAddress) {
    metadata.ipAddress = ipAddress;
  }

  return metadata;
};

export const signup: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const result = await registerUser({ email, password }, getRequestMetadata(req));

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const result = await authenticateUser(email, password, getRequestMetadata(req));

    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

export const refresh: RequestHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    const tokens = await refreshAuthTokens(refreshToken, getRequestMetadata(req));

    return res.json(tokens);
  } catch (error) {
    return next(error);
  }
};

export const logout: RequestHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

