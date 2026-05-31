import axiosInstance from "../lib/axios";
import {
  CRMDocumentByIdResponse,
  CRMDocumentsResponse,
} from "../interface/documents";
import { size } from "@/constants/constants";
import { FieldValues } from "react-hook-form";

export const getCRMDocuments = async (
  page: number,
  filterType?: "company" | "contact" | "job",
  filterId?: string,
  search?: string
): Promise<CRMDocumentsResponse> => {
  const searchParam = search ? `&search=${search}` : "";
  if (filterType && filterId)
    return await axiosInstance.get(
      `/api/documents/v1/list/?page=${page}&page_size=${size}&${filterType}_id=${filterId}${searchParam}`
    );

  return await axiosInstance.get(
    `/api/documents/v1/list/?page=${page}&page_size=${size}${search && "&search=" + search}`
  );
};

export const addDocument = async (data: FieldValues): Promise<any> => {
  const formData = new FormData();

  !data?.linked_job
    ? formData.append("linked_job", "")
    : formData.append("linked_job", data?.linked_job);

  if (data.file) {
    const byteString = atob(data.file.base64);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([uint8Array], { type: "application/octet-stream" });
    const file = new File([blob], data.file.name);

    formData.append("file", file);
    formData.append("file_name", data.file.name);
  } else {
    console.log("No file provided");
  }

  return await axiosInstance.post(`/api/documents/create/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteDocumentsById = async (id: number) => {
  return await axiosInstance.delete(`api/documents/delete/${id}/`);
};

export const getDocumentById = async (
  id: string
): Promise<CRMDocumentByIdResponse> => {
  return await axiosInstance.get(
    `api/documents/v1/${id}/`
    // , { responseType: "blob" }
  );
};
