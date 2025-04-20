import axios, { AxiosInstance } from "axios";

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL as string;

// Axios public instance (không gửi cookie)
const axiosPublic: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Axios private instance (gửi cookie, dùng cho auth)
export const axiosPrivate: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export default axiosPublic;
