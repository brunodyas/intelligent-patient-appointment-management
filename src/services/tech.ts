import axiosInstance from "@/lib/axios";

export const getTech = async (filter: any, page: any, size: number): Promise<any> => {
  return await axiosInstance.get(
    `/api/tech/${filter}/?page=${page}&page_size=${size}`
  );
};

export const getNextAppointmentDriveTime = async (addressData: any): Promise<any> => {
  return await axiosInstance.post(
    `api/utils/google/distance-matrix/`, addressData
  );
};

export const getTechnicianSchedule = async (date: any, franchise: any): Promise<any> => {
  return await axiosInstance.get(
    `/api/tech/tech-schedule/?date=${date}&timezone=${franchise.franchise_timezone}`
  );
};
