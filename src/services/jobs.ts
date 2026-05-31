import {
  CRMJob,
  CRMJobTechsResponse,
  CRMJobsResponse,
  DetermineFranchiseResponse,
} from "@/interface/jobs";
import axiosInstance from "@/lib/axios"; 
import { FieldValues } from "react-hook-form";
import tempAxiosInstance from "@/lib/tempAxios";
import { size } from "@/constants/constants";
// list-jobs-short/

export const getCRMJobs = async (
  page: number,
  filterType?: "company" | "job" | "contact",
  filterId?: string,
  pipeline?: string,
  stage?: string,
  search?: string,
  fullData?: boolean 
): Promise<CRMJobsResponse> => {
  if (filterType && filterId && fullData)
    return axiosInstance.get(
      `/api/jobs/v1/list-jobs-table-view/?page=${page}&${filterType}_id=${filterId}&page_size=${size}${search && "&search="+search}`
    );
  else if (filterType && filterId)
      return axiosInstance.get(
        `/api/jobs/v1/list-jobs-short/?page=${page}&${filterType}_id=${filterId}&page_size=${size}${search && "&search="+search}`
      );

  if (pipeline && stage)
    return axiosInstance.get(
      `/api/jobs/v1/list-jobs-short/?page=${page}&pipeline_filter=${pipeline}&stage_filter=${stage}&page_size=10${search && "&search="+search}`
    );

  console.log(search)
  return await axiosInstance(
    `/api/jobs/v1/list-jobs-table-view/?page=${page}&page_size=${size}${search && "&search="+search}`
  );
};

export const getJobsById = async (id: string): Promise<CRMJob> => {
  return await axiosInstance.get(`api/jobs/v1/view-job/${id}/`);
};

export const getJobsOutOfService = async (
  page: number,
  search?: string
): Promise<CRMJobsResponse> => {
  return await axiosInstance.get(
    `api/jobs/v1/list-jobs-with-null-franchise/?page=${page}&page_size=${size}${search && "&search="+search}`
  );
};

export const addJob = async (data: FieldValues): Promise<any> => {
  return await axiosInstance.post("/api/jobs/create-job/", data);
};

export const updateJobById = async (
  id: string,
  data: FieldValues
): Promise<any> => {
  return await tempAxiosInstance.put(`api/jobs/update-job/${id}/`, data);
};

export const sendQuote = async (
  id: string,
): Promise<any> => {
  return await tempAxiosInstance.post(`api/jobs/send-quote/${id}/`);
};

export const cancelInvoice = async (
  id: string,
): Promise<any> => {
  return await axiosInstance.post(`api/jobs/cancel-invoice/${id}/`);
};

export const getTechs = async (
  date: any,
  duration?: string
): Promise<CRMJobTechsResponse> => {
  return await axiosInstance.get(
    `api/user/v1/list/?user_role=Tech&page=1&date=${date}&duration=${duration}`
  );
};

export const deleteJobById = async (id: number): Promise<any> => {
  return await axiosInstance.delete(`api/jobs/delete-job/${id}/`);
};

export const externalAddJob = async (data: FieldValues): Promise<any> => {
  return await axiosInstance.post("/api/jobs/external-create-job/", data);
};

export const createJobAll = async (data: FieldValues): Promise<any> => {
  return await axiosInstance.post(
    "/api/jobs/create-job-with-company-and-contact/",
    data
  );
};

export const determineFranchise = async (
  data: FieldValues
): Promise<DetermineFranchiseResponse> => {
  return await axiosInstance.post(
    "/api/jobs/determine-appointment-franchise/",
    data
  );
};

export const getAppointmentsTimes = async (data: FieldValues): Promise<any> => {
  return await axiosInstance.post(
    "/api/jobs/available-appointment-times/",
    data
  );
};
