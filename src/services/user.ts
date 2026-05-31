import { FieldValues } from "react-hook-form";
import axiosInstance from "@/lib/axios";
import {
  AddUserFranchiseResponse,
  UserDetailsResponse,
  UserListResponse,
  UserListDetails,
} from "@/interface/user";
import { size } from "@/constants/constants";
import { formatPhoneNum } from "@/utils/formatHelper";
import {
  convertLocalTimeToUtc,
  convertUtcToLocalTime,
} from "@/utils/utcToLocalTimeZone";

export const AddUser = async (
  data: FieldValues
): Promise<AddUserFranchiseResponse> => {
  const formData = new FormData();

  for (const key in data) {
    if (key !== "photo" && key !== "image" && data[key] !== null) {
      if (key === "user_phone" && data[key]) {
        formData.append(key, formatPhoneNum(data[key]));
      } else if (
        key.includes("shift_start_time") ||
        key.includes("shift_end_time")
      ) {
        formData.append(key, convertLocalTimeToUtc(data[key])?.replace(" UTC","") ?? "");
      } else {
        formData.append(key, data[key]);
      }
    }
  }

  if (data?.photo) {
    formData.append("photo", data.photo);
  } else {
    console.warn("No photo provided");
  }
  return await axiosInstance.post("api/user/add-user-to-franchise/", formData);
};

export const EditUser = async (
  data: FieldValues,
  userId: number
): Promise<AddUserFranchiseResponse> => {
  const formData = new FormData();

  for (const key in data) {
    if (
      key !== "photo" &&
      key !== "image" &&
      key !== "franchise" &&
      data[key] !== null
    ) {
      if (key === "user_phone" && data[key]) {
        formData.append(key, formatPhoneNum(data[key]));
      } else if (
        key.includes("shift_start_time") ||
        key.includes("shift_end_time")
      ) {
        formData.append(key, convertLocalTimeToUtc(data[key])?.replace(" UTC","") ?? "");
      } else {
        formData.append(key, data[key]);
      }
    }
  }

  if (data.photo) {
    formData.append("photo", data.photo);
  } else {
    console.warn("No photo provided");
  }

  return await axiosInstance.patch(`api/user/update-user/${userId}/`, formData);
};

export const EditProfile = async (
  data: FieldValues
): Promise<AddUserFranchiseResponse> => {
  const formData = new FormData();

  for (const key in data) {
    if (key !== "photo" && data[key] !== null) {
      if (key === "user_phone" && data[key]) {
        formData.append(key, `+1${data[key]}`);
      } else if (
        key.includes("shift_start_time") ||
        key.includes("shift_end_time")
      ) {
        const timeValue = data[key];
        let formattedTime;
  
        if (/^\d{2}:\d{2}:\d{2}$/.test(timeValue)) {
          // If the time is in HH:mm:ss format, convert it to HH:mm
          formattedTime = timeValue.slice(0, 5);
        } else if (/^\d{2}:\d{2}$/.test(timeValue)) {
          // If already in HH:mm format, use as-is
          formattedTime = timeValue;
        } else {
          console.warn(`Invalid time format for ${key}:`, timeValue);
          formattedTime = timeValue; // Fallback to original value
        }
  
        formData.append(
          key,
          convertLocalTimeToUtc(formattedTime)?.replace(" UTC", "") ?? ""
        );
      } else {
        formData.append(key, data[key]);
      }
    }
  }

  if (data.photo) {
    formData.append("photo", data.photo);
  } else {
    console.warn("No photo provided");
  }

  return await axiosInstance.put(`api/user/update-user/`, formData);
};

export const UserDetails = async (): Promise<UserDetailsResponse> => {
  return await axiosInstance.get("api/user/user-details/");
};

export const listUsers = async (
  role: string,
  page: number,
  franchiseId: string | null = null,
  searchValue?:string
): Promise<UserListResponse> => {
  const params: Record<string, string | number | boolean> = {
    user_role: role,
    page: page,
    page_size: size,
  };

  if (franchiseId) {
    params.franchise_id = franchiseId;
  }
  if (searchValue) {
    params.search = searchValue;
  }

  if (window.location.pathname.includes("users")) {
    params.is_users_page = 'True';
  }

  return await axiosInstance.get("api/user/v1/list/", { params });

};

export const listFranchises = async (
  page: number
): Promise<UserListResponse> => {
  return await axiosInstance.get(
    `api/user/franchises?page=${page}&page_size=${size}`
  );
};

export const getActiveUsers = async (): Promise<any> => {
  return await axiosInstance.get("api/user/v1/list/active-users");
};

export const GetUserDetailsByID = async (
  userId: string
): Promise<UserListDetails> => {
  const response: UserListDetails = await axiosInstance.get(
    `api/user/get-user-profile-by-id/${userId}/`
  );
  return {
    ...response,
    shift_start_time:
      response?.shift_start_time ?
      convertUtcToLocalTime(response.shift_start_time + " UTC") : null,
    shift_end_time:
      response?.shift_end_time ?
      convertUtcToLocalTime(response.shift_end_time + " UTC") : null,
  };
};

export const DeleteUserByID = async (userId: string) => {
  return await axiosInstance.delete(`api/user/delete-user/${userId}/`);
};
