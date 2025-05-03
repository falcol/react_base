import { axiosPrivate } from "@lib/axios";

export interface SearchResponse {
  data: any[];
  page: number;
  recordTotal: number;
  recordFilter: number;
}

export interface SearchParams {
  page?: number;
  pageSize?: number;
  application_no?: string;
  title?: string;
  status?: string;
  manager?: string;
  customer_code?: string;
  register_date_start?: string;
  register_date_end?: string;
  category?: string;
}

export const searchApi = async (params: SearchParams) => {
  const response = await axiosPrivate.get<SearchResponse>("/forms/search", {
    params,
  });
  return response.data;
};
