import { combineReducers, configureStore } from '@reduxjs/toolkit';

import appReducer from "./slices/AppSlice";
import authReducer from "./slices/authSlice";
import usersReducer from "./slices/userSlice";
import cvReducer from "./slices/cvSlice";
import contactReducer from "./slices/contactSlice";
import invoiceReducer from "./slices/invoiceSlice";
import quoteReducer from "./slices/quoteSlice";
import creditNoteReducer from "./slices/creditNoteSlice";

import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import storage from 'redux-persist/lib/storage';

/*export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    user: usersReducer,
    cv: cvReducer
  },
});*/

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
}

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  user: usersReducer,
  cv: cvReducer,
  contact: contactReducer,
  invoice: invoiceReducer,
  quote: quoteReducer,
  creditNote: creditNoteReducer,
});


const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    }
  }),
  devTools: true,
  // devTools: process.env.NODE_ENV !== 'production'
});

// export const persistor = persistStore(store);