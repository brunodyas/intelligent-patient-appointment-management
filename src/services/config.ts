import { CRMConfigByIdResponse, CRMConfig, BlindInterface, SelectedBlindPayload, CreateConfigResponse } from "@/interface/config";
import axiosInstance from "@/lib/axios";
import { FieldValues } from "react-hook-form";

export const getConfigs = async (jobId: string,isSort:boolean,searchQuery?:string): Promise<CRMConfig[]> => {
  return await axiosInstance.get(`/api/product_config/list-configs-by-job/${jobId}${searchQuery ? `?search=${searchQuery}`: ""}${searchQuery ? "&" : "?"}sort=${isSort ? "desc" : "asc"}`)
}

export const createConfig = async (data: FieldValues): Promise<CreateConfigResponse> => {
  const formData = new FormData();

  Object.keys(data).forEach(key => {
    if (data[key] instanceof File) {
      formData.append(key, data[key]);
    } else if (typeof data[key] === 'object') {
      formData.append(key, JSON.stringify(data[key]));
    } else {
      formData.append(key, data[key]);
    }
  });

  return await axiosInstance.post("/api/product_config/create/", formData, {headers: { 'Content-Type': 'multipart/form-data' }})
}

export const updateConfig = async (data: FieldValues): Promise<CreateConfigResponse> => {
  const formData = new FormData();

  Object.keys(data).forEach(key => {
    if (data[key] instanceof File) {
      formData.append(key, data[key]);
    } else if (typeof data[key] === 'object') {
      formData.append(key, JSON.stringify(data[key]));
    } else {
      formData.append(key, data[key]);
    }
  });

  return await axiosInstance.put(`/api/product_config/update/${data.id}/`, formData, {headers: { 'Content-Type': 'multipart/form-data' }})
}

export const getConfigById = async (configId: number): Promise<CRMConfigByIdResponse> => {
  return await axiosInstance.get(`/api/product_config/config-details/${configId}/`)
}

export const filterBlindsFeatures = async (data: FieldValues): Promise<BlindInterface[]> => {
  return await axiosInstance.post("api/products/filter-blinds-features/", data)
}

export const createChosenConfig = async (configId: number, data: SelectedBlindPayload): Promise<any> => {
  return await axiosInstance.post(`/api/product_config/create-chosen-config/${configId}/`, data )
}

export const deleteConfigById = async (configId: number): Promise<any> => {
  return await axiosInstance.delete(`/api/product_config/delete/${configId}/`)
}

export const generateFirstInvoice = async (jobId: number): Promise<any> => {
  return await axiosInstance.post(`/api/jobs/create_first_invoice/${jobId}/`)
}

export const generateSecondInvoice = async (jobId: number): Promise<any> => {
  return await axiosInstance.post(`/api/jobs/create_second_invoice/${jobId}/`)
}

export const generateFullInvoiceForRepairsPipeline = async (jobId: number): Promise<any> => {
  return await axiosInstance.post(`/api/jobs/create_full_invoice/${jobId}/`)
}