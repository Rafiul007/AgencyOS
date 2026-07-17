import { configureStore } from '@reduxjs/toolkit';

// Redux is intentionally small: global client state only (session, active tenant,
// theme, global UI). Server data lives in TanStack Query, not here.
export const store = configureStore({
  reducer: {
    // feature slices are registered here as they are built
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
