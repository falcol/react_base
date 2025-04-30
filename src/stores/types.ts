// src/stores/types.ts
import type { AuthState } from "@/features/auth/stores/auth.slice"; // ✅ chỉ import type
import type { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";

export interface RootState {
  auth: AuthState;
}

export type AppDispatch = ThunkDispatch<RootState, any, AnyAction>;
