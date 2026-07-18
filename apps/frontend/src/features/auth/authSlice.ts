import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IAuthUser } from '@agencyos/shared';

export type AuthStatus = 'loading' | 'authenticated' | 'guest';

interface IAuthState {
  user: IAuthUser | null;
  status: AuthStatus;
}

const initialState: IAuthState = { user: null, status: 'loading' };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<IAuthUser>) {
      state.user = action.payload;
      state.status = 'authenticated';
    },
    setGuest(state) {
      state.user = null;
      state.status = 'guest';
    },
  },
});

export const { setUser, setGuest } = authSlice.actions;
export default authSlice.reducer;
