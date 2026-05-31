import axiosInstance from "@/lib/axios";

export const getDispatch = async (filter: any, page: any, size: number): Promise<any> => {
  return await axiosInstance.get(
    `/api/dispatch/v1/${filter}/?page=${page}&page_size=${size}`
  );
};

export const getTechnicianScheduler = async (date: any, franchise: any): Promise<any> => {
  return await axiosInstance.get(
    `/api/dispatch/v1/technician-schedules/?date=${date}&timezone=${franchise.franchise_timezone}`
  );
};

export const updateTechnicianColor = async (techId: string, color: string): Promise<any> => {
  return await axiosInstance.put(`/api/dispatch/update-user-color/${techId}/`, { user_color: color });
};