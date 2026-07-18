import { useEffect, type ReactNode } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { tokenStorage } from '@/lib/tokenStorage';
import { fetchCurrentUser } from './api';
import { setGuest, setUser } from './authSlice';

/** Bootstraps auth state on load: if a token exists, resolve the current user. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!tokenStorage.access) {
      dispatch(setGuest());
      return;
    }
    fetchCurrentUser()
      .then((user) => dispatch(setUser(user)))
      .catch(() => {
        tokenStorage.clear();
        dispatch(setGuest());
      });
  }, [dispatch]);

  return <>{children}</>;
}
