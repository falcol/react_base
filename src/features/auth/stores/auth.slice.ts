// src/features/auth/stores/auth.slice.ts
import type { AppDispatch } from "@/stores/types"; // ✅ OK
import { axiosPrivate, axiosPublic } from "@lib/axios";
import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: Cookies.get("accessToken") || null,
  isAuthenticated: !!Cookies.get("accessToken"),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    startLoading(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
    loginFailed(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      Cookies.remove("accessToken");
    },
  },
});

export default authSlice.reducer;
export const { startLoading, loginSuccess, loginFailed, setUser, logout } =
  authSlice.actions;

// Async actions
export const login =
  (username: string, password: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch(startLoading());
      const res = await axiosPublic.post("/login", { username, password });
      const accessToken = res.data.accessToken;
      Cookies.set("accessToken", accessToken, { secure: true });
      dispatch(loginSuccess(accessToken));
    } catch (err: any) {
      dispatch(loginFailed(err.response?.data?.message || "Login failed"));
    }
  };

export const fetchUserInfo = () => async (dispatch: AppDispatch) => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) return dispatch(logout());

    const res = await axiosPrivate.get("/me");
    dispatch(setUser(res.data));
  } catch (err: any) {
    dispatch(logout());
  }
};
