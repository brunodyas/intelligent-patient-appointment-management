import axiosInstance from "../lib/axios";
import { size } from "@/constants/constants";


export const getWebActivities = async (
    page: number,
    searchQuery?: string
  ): Promise<any> => {
    return await axiosInstance.get(
      `/api/webpixeldata/list/?page=${page}&page_size=${size}${searchQuery ? `&search=${searchQuery}`: ""}`
    );
  };

  export const getActivity = async (
    id: string,
  ): Promise<any> => {
    return await axiosInstance.get(
      `/api/webpixeldata/details/${id}/`
    );
  };

