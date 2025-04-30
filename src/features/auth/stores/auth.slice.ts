// src/features/auth/stores/auth.slice.ts
import type { AppDispatch } from "@/stores/store"; // ✅ OK
import { axiosPublic } from "@lib/axios";
import { createSlice } from "@reduxjs/toolkit";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { getUserInfoApi } from "../api/api.auth";

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

export const useUserInfoQuery = () => {
  return useQuery({
    queryKey: ["userInfo"],
    queryFn: getUserInfoApi,
    enabled: !!Cookies.get("accessToken"), // chỉ chạy nếu có token
    refetchOnWindowFocus: true, // Gọi lại khi user chuyển tab rồi quay lại
    refetchOnReconnect: true, // Gọi lại nếu mất mạng rồi có lại
    staleTime: 0,
    retry: false, // không retry nếu fail (ví dụ token hết hạn)
  });
};
