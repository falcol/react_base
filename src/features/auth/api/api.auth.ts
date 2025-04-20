import axiosPublic, { axiosPrivate } from "@lib/axios";

export const loginApi = async (username: string, password: string) => {
  const response = await axiosPublic.post("/api/login", {
    username,
    password,
  });
  return response.data;
};

export const getUserInfoApi = async (token: string) => {
  const response = await axiosPrivate.get("/api/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
