/**
 * Redux Store Configuration
 * Configures the main Redux store with all slices
 */

import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import campaignSlice from './slices/campaignSlice';
import recipientSlice from './slices/recipientSlice';
import smtpSlice from './slices/smtpSlice.js';
import templateSlice from './slices/templateSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    campaigns: campaignSlice,
    recipients: recipientSlice,
    smtp: smtpSlice,
    templates: templateSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: import.meta.env.DEV,
});

// TypeScript types would go here if this was a .ts file
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

export default store;
