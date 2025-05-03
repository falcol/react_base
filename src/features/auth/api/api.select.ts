import { axiosPublic } from "@lib/axios";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectResponse {
  data: SelectOption[];
  currentPage: number;
  totalPages: number;
}

export interface SelectParams {
  field: string;
  page: number;
  pageSize: number;
  search?: string;
}

export const selectApi = async (params: SelectParams) => {
  const response = await axiosPublic.get<SelectResponse>("/forms/selects", {
    params,
  });
  return response.data;
};
