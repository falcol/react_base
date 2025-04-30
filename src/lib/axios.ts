// src/lib/axios.ts
import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL as string;

export const axiosPublic: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const axiosPrivate: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ============ 👇 ADD THIS PART 👇 ============
let logoutCallback: (() => void) | null = null;

export function setLogoutCallback(callback: () => void) {
  logoutCallback = callback;
}
// ============================================

// Request interceptor
axiosPrivate.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axiosPublic.post(
          "/refresh2",
          {},
          { withCredentials: true },
        );
        const { accessToken } = response.data;

        Cookies.set("accessToken", accessToken, { secure: true });

        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return axiosPrivate(originalRequest);
      } catch (refreshError) {
        Cookies.remove("accessToken");
        logoutCallback?.(); // ✅ Gọi callback logout
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
