import axiosInstance from "@/lib/axios";

export const get_product_types = async () => {
     return await axiosInstance.post(`/api/newConfig/product-types/`, {});
};

export const get_vendors = async (data: any) => {
    return await axiosInstance.post(`/api/newConfig/vendors/`, data);
};

export const get_products = async (data: any) => {
    return await axiosInstance.post(`/api/newConfig/products/`, data);
};

export const get_styles = async (data: any) => {
    return await axiosInstance.post(`/api/newConfig/styles/`, data);
};

export const get_options = async (data: any) => {
    return await axiosInstance.post(`/api/newConfig/product-options/`, data);
};

export const validate = async (data: any) => {
    return await axiosInstance.post(`/api/newConfig/validate-options/`, data);
};

