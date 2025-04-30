import authReducer from "@/features/auth/stores/auth.slice";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import { createFilter } from "redux-persist-transform-filter";
import storage from "redux-persist/lib/storage";

const authFilter = createFilter("auth", ["accessToken", "isAuthenticated"]);

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
  transforms: [authFilter],
};

const rootReducer = combineReducers({
  auth: authReducer,
});

// ✅ Fix lỗi ở đây bằng cách khai báo rõ kiểu của persistedReducer
const persistedReducer = persistReducer<ReturnType<typeof rootReducer>>(
  persistConfig,
  rootReducer,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
      serializableCheck: false,
    }),
  devTools: import.meta.env.VITE_MODE !== "production",
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
