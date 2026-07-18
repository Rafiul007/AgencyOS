import type { IAuthTokens } from '@agencyos/shared';

// Token persistence for the trial. Note: for hardening, the access token would live
// in memory only and the refresh token in an httpOnly cookie; kept simple here.
const ACCESS_KEY = 'agencyos_access';
const REFRESH_KEY = 'agencyos_refresh';

export const tokenStorage = {
  get access(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  },
  get refresh(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  },
  set(tokens: IAuthTokens): void {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  },
  clear(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
