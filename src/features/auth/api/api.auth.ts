import { axiosPrivate, axiosPublic } from "@lib/axios";

export const loginApi = async (username: string, password: string) => {
  const response = await axiosPublic.post("/login", {
    username,
    password,
  });
  return response.data;
};

export const getUserInfoApi = async () => {
  const response = await axiosPrivate.get("/me");
  return response.data;
};
