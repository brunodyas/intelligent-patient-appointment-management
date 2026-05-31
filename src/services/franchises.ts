import axiosInstance from "../lib/axios";
import { FieldValues } from "react-hook-form";
import { size } from "@/constants/constants";
import { ListFranchisesResponse } from "@/interface/franchises";
import { formatPhoneNum, formatURL } from "@/utils/formatHelper";
import { convertLocalTimeToUtc } from "@/utils/utcToLocalTimeZone";

export const getFranchises = async (
  page: number,
  searchQuery?: string,
  filter?: { 
    isSort?: boolean;
  },
): Promise<ListFranchisesResponse> => {
  console.log("filter", filter);
  return await axiosInstance.get(
    `/api/user/franchises/?page=${page}&page_size=${size}${searchQuery ? `&search=${searchQuery}`: ""}&sort=${
        filter?.isSort ? "asc" : "desc"}`
  );
};

export const getFranchiseDetails = async (id: string): Promise<any> => {
  return await axiosInstance.get(
    `/api/user/franchises/detail?page=1&page_size=1&franchise_id=${id}`
  );
};

export const addFrenchiseWithUser = async (data: FieldValues): Promise<any> => {
  const transformData = (data: any) => {
    return {
      name: data.name,
      email: data.email,
      ...(data?.photo && { photo: data?.photo }),
      user_phone: formatPhoneNum(data.user_phone),
      role: data.role,
      ...(data?.shift_start_time && {
        shift_start_time: convertLocalTimeToUtc(data.shift_start_time)?.replace(" UTC",""),
      }),
      ...(data?.shift_end_time && {
        shift_end_time: convertLocalTimeToUtc(data.shift_end_time)?.replace(" UTC",""),
      }),
      franchise: {
        franchise_name: data.franchise_name,
        // price_markup: data.price_markup,
        franchise_address: data.franchise_address,
        zip_codes_covered: data?.zip_codes_covered,
        zip_codes_would_accept_outside_owned: data?.zip_codes_would_accept_outside_owned,
        ...(data.website_url.trim() !== "" ? {website_url: formatURL(data.website_url)} : {}),
        // is_manufacturer: data.is_manufacturer === "Yes" ? "True" : "False",
      },
      password: data.password,
      tech_vehicle: data.tech_vehicle,
      tech_license_plate: data.tech_license_plate,
    };
  };

  const transformedData = transformData(data);

  const formData = new FormData();
  Object.keys(transformedData).forEach((key) => {
    if (
      typeof transformedData[key] === "object" &&
      transformedData[key] !== null
    ) {
      Object.keys(transformedData[key]).forEach((nestedKey) => {
        formData.append(
          `${key}[${nestedKey}]`,
          Array.isArray(transformedData[key][nestedKey]) 
            ? JSON.stringify(transformedData[key][nestedKey]) 
            : transformedData[key][nestedKey] 
        );
      });
    } else {
      formData.append(key, transformedData[key]);
    }
  });
  if (data?.photo) {
    formData.append("photo", data.photo);
  }
  return await axiosInstance.post(
    `/api/user/create-user-and-franchise/`,
    formData
  );
};

export const updateFrenchise = async (arg: {
  id: string;
  editData: any;
}): Promise<any> => {
  return await axiosInstance.put(
    `/api/user/franchises/update/${arg?.id}/`,
    arg?.editData
  );
};

export const updateFranchisePrimaryNumber = async (arg: {
  id: string;
  editData: any;
}): Promise<any> => {
  return await axiosInstance.put(
    `/api/user/franchises/update-primary-number/${arg?.id}/`,
    arg?.editData
  );
};

export const deleteFrenchise = async (id: string): Promise<any> => {
  return await axiosInstance.delete(`/api/user/franchises/delete/${id}/`);
};
