import type { UserRole } from '@agencyos/shared';

/** The authenticated principal attached to `req.user` by the JWT strategy. */
export interface IRequestUser {
  id: string;
  email: string;
  role: UserRole;
  tenantId: string;
}

/** Claims embedded in the access token. */
export interface IAccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  tenantId: string;
}

/** Claims embedded in the refresh token (jti = RefreshToken row id). */
export interface IRefreshTokenPayload {
  sub: string;
  jti: string;
}
