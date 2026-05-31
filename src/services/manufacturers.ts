import axiosInstance from '../lib/axios';
import { AddproductsResponse,GetProductsResponse } from '../interface/manufacturers';
import { UserListResponse } from '@/interface/user';
import { FieldValues } from 'react-hook-form';
import { size } from '@/constants/constants';

export const addProduct = async (data: FormData):Promise<AddproductsResponse> => {
  return await axiosInstance.post('/api/products/blinds/', data)
}
export const editProduct = async (data: FieldValues, isEdit: number):Promise<AddproductsResponse> => {
  return await axiosInstance.put(`/api/products/blinds/${isEdit}/`, data)
}
export const getProducts = async(page: number,searchQuery?:string): Promise<GetProductsResponse> => {
  return await axiosInstance.get(`/api/products/blinds/?page=${page}&page_size=${size}${searchQuery ? `&search=${searchQuery}`: ""}`)
}
export const listFranchises = async (
  page: number
): Promise<UserListResponse> => {
  return await axiosInstance.get(
    `api/user/franchises?page=${page}&page_size=${size}&filter_manufacturers=true`
  );
};
export const deleteProduct = async (id: number): Promise<void> => {
  return await axiosInstance.delete(`/api/products/blinds/${id}/`)
}
export const getProduct = async (id: number): Promise<AddproductsResponse> => {
  return await axiosInstance.get(`/api/products/blinds/${id}/`)
}