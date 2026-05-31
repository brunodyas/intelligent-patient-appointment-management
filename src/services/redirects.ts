import axiosInstance from "../lib/axios";
import { size } from "@/constants/constants";

export const getRedirects = async (
  page: number,
  searchQuery?: string
): Promise<any> => {
  return await axiosInstance.get(
    `/api/call/redirects/?page=${page}&page_size=${size}${searchQuery ? `&search=${searchQuery}` : ""}`
  );
};

export const addRedirect = async (
  data: any
): Promise<any> => {
  return await axiosInstance.post(
    `/api/call/redirects/`, data
  );
};

export const getRedirectsById = async (
  id: string,
): Promise<any> => {
  return await axiosInstance.get(
    `/api/call/redirects/${id}/`
  );
};

export const deleteRedirects = async (id: string): Promise<any> => {
  return await axiosInstance.delete(`/api/call/redirects/${id}/`);
};

export const updateRedirects = async (arg: {
  id: string;
  editData: any;
}): Promise<any> => {
  console.log("🚀 ~ editData:", arg?.editData)
  return await axiosInstance.put(
    `/api/call/redirects/${arg?.id}/`,
    arg?.editData
  );
};



