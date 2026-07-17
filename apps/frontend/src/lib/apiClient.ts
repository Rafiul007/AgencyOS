import axios from 'axios';
import type { IApiError } from '@agencyos/shared';

// Central, typed API client. Components never call axios/fetch directly — they use
// named helper functions and query hooks that build on this instance.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Normalizes backend error envelopes into a predictable shape for the UI.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const envelope = error?.response?.data as IApiError | undefined;
    // TODO: single-flight token refresh on 401 goes here.
    return Promise.reject(envelope ?? error);
  },
);
