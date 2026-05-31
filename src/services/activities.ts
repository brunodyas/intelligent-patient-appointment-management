import { FieldValues } from "react-hook-form";
import axiosInstance from "../lib/axios";
import {
  AddActityResponse,
  CRMActivitiesResponse,
  CRMActivityByIdResponse,
  ActivitiesByDateRange,
} from "@/interface/activities";
import { size } from "@/constants/constants";
import moment from "moment";
import { useJune } from "@/hooks/useJune";
export const getCRMActivities = async (
  page: number,
  filterType?: "company" | "job" | "contact",
  filterId?: string,
  filter?: {
    completed?: boolean;
    isSort?: boolean;
  },
  search?: string
): Promise<CRMActivitiesResponse> => {
  if (filterType && filterId)
    return await axiosInstance.get(
      `/api/activities/v1/list/?page=${page}&${filterType}_id=${filterId}&page_size=${size}&completed=${!!filter?.completed}&sort_order=${
        filter?.isSort ? "desc" : "asc"
      }&${search && `search=${search}`}`
    );

  return await axiosInstance.get(
    `/api/activities/v1/list/?page=${page}&page_size=${size}&completed=${!!filter?.completed}&sort_order=${
      filter?.isSort ? "desc" : "asc"
    }${search && `&search=${search}`}`
  );
};

export const addActivity = async (
  data: FieldValues
): Promise<AddActityResponse> => {
  return await axiosInstance.post("/api/activities/create/", data);
};

export const deleteActivityById = async (id: number) => {
  return await axiosInstance.delete(`api/activities/delete/${id}/`);
};

export const updatedStatusActivityById = async (data: FieldValues) => {
  const formData = new FormData();

  if (data) {
    formData.append("activity_name", data.activity_name);
    formData.append("activity_type", data.activity_type);
    formData.append("due_date", data.due_date);
    formData.append("completed", data.completed);
    if (data?.completed) {
      formData.append("completed_date", moment().format("YYYY-MM-DD"));
    } else {
      formData.append("completed_date", "");
    }
  } else {
    console.log("No data.");
  }

  return await axiosInstance.put(
    `api/activities/update/${data?.id}/`,
    formData
  );
};

export const getActivityById = async (
  id: string
): Promise<CRMActivityByIdResponse> => {
  return await axiosInstance.get(`api/activities/v1/view-details/${id}/`);
};

export const getActivitiesByDateRange = async (
  start_date: string,
  end_date: string,
  filterType?: "company" | "job" | "contact" | "documents",
  filterId?: string
): Promise<ActivitiesByDateRange> => {
  const params: Record<string, string | undefined> = {
    start_date,
    end_date,
  };

  if (filterType && filterId) {
    params[`${filterType}_id`] = filterId;
  }

  return await axiosInstance.get("/api/activities/v1/listByDateRange", {
    params,
  });
};
