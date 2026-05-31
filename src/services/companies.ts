import axiosInstance from '../lib/axios';
import { CRMCompaniesResponse, AddCompanyResponse, CRMCompanyByIdResponse, CRMCompanyEditForm } from '../interface/companies';
import { FieldValues } from 'react-hook-form';
import { Note } from '@/interface/contacts';
import { size } from '@/constants/constants';

export const getCRMCompanies = async (page: number, search?: string): Promise<CRMCompaniesResponse> => {
  return await axiosInstance.get(`/api/companies/v1/list/?page=${page}&page_size=${size}${search && "&search="+search}`)
}

export const addCompany = async (data: FieldValues): Promise<AddCompanyResponse> => {
  return await axiosInstance.post('/api/companies/create/', data)
}

export const getCompanyById = async (id: string): Promise<CRMCompanyByIdResponse> => {
  return await axiosInstance.get(`api/companies/v1/view-details/${id}/`)
}

export const editCompanyById = async (id: string, editData: CRMCompanyEditForm): Promise<CRMCompanyByIdResponse> => {
  return await axiosInstance.put(`api/companies/update/${id}/`, editData)
}

export const deleteCompanyById = async (id: string) => {
  return await axiosInstance.delete(`api/companies/delete/${id}/`)
}

export const addCompanyNote = async (
  id: number,
  note: string
): Promise<Note> => {
  return await axiosInstance.post(`api/companies/notes/${id}/create/`, { note });
};

export const getCompanyNotesById = async (
  id: string
): Promise<Note[]> => {
  return await axiosInstance.get(`api/companies/v1/notes/${id}/list/`);
};