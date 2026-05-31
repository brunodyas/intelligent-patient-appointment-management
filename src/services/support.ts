import {
  CreateBugTrackerResponse,
  CreateRequestResponse,
} from "@/interface/support";
import axiosInstance from "@/lib/axios";
import formatDate from "@/utils/formatDate";
import { FieldValues } from "react-hook-form";

export const createBugTracker = async (
  data: FieldValues
): Promise<CreateBugTrackerResponse> => {
  const formData = new FormData();

  formData.append("description", data.description);
  formData.append("priority", data.priority);
  formData.append("screenshot_link", data.screenshot_link);

  return await axiosInstance.post("/api/support/bugTracker/", formData);
};

export const createRequest = async (
  data: FieldValues
): Promise<CreateRequestResponse> => {
  const formData = new FormData();

  formData.append("description", data.description);
  formData.append("priority", data.priority);

  return await axiosInstance.post("/api/support/featureRequest/", formData);
};
