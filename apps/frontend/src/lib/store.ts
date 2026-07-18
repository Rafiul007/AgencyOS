import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';

// Redux is intentionally small: global client state only (session, active tenant,
// theme, global UI). Server data lives in TanStack Query, not here.
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
