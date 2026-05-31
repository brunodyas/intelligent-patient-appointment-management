import axiosInstance from "../lib/axios";
import { size } from "@/constants/constants";


export const getBlockedNumbers = async ({
    page,
    searchQuery,
    orderQuery
}: {
    page: number,
    searchQuery?: string,
    orderQuery?: string
}): Promise<any> => {
    return await axiosInstance.get(
        `/api/call/list-blocked-numbers/?page=${page}&page_size=${size}${searchQuery ? `&search=${searchQuery}` : ""}${orderQuery ? `&order=${orderQuery}` : ""}`
    );
};

export const addBlocked = async (
    data: any
): Promise<any> => {
    return await axiosInstance.post(
        `/api/call/block-number/`, data
    );
};

export const deleteBlocked = async (id: string): Promise<any> => {
    return await axiosInstance.delete(`/api/call/delete-blocked-number/${id}/`);
};