import axios from 'axios';
import type { IApiError, IAuthTokens } from '@agencyos/shared';
import { tokenStorage } from './tokenStorage';

const baseURL = import.meta.env.VITE_API_BASE_URL;

// Central, typed API client. Components never call axios/fetch directly — they use
// named helper functions and query hooks that build on this instance.
export const apiClient = axios.create({ baseURL, withCredentials: true });

// Attach the access token to every request.
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.access;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Single-flight refresh: on a 401, refresh once and retry the original request.
let refreshing: Promise<void> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error?.response?.status;

    if (status === 401 && original && !original._retry && tokenStorage.refresh) {
      original._retry = true;
      try {
        if (!refreshing) {
          refreshing = axios
            .post<IAuthTokens>(`${baseURL}/auth/refresh`, { refreshToken: tokenStorage.refresh })
            .then(({ data }) => {
              tokenStorage.set(data);
            })
            .finally(() => {
              refreshing = null;
            });
        }
        await refreshing;
        original.headers.Authorization = `Bearer ${tokenStorage.access}`;
        return apiClient(original);
      } catch {
        tokenStorage.clear();
      }
    }

    const envelope = error?.response?.data as IApiError | undefined;
    return Promise.reject(envelope ?? error);
  },
);
