import { FieldValues } from 'react-hook-form';
import { size } from '@/constants/constants';
import axiosInstance from '../lib/axios';
import { CRMContactsResponse, AddContactResponse, CRMContactByIdResponse, Note, CRMContactEditFrom } from '../interface/contacts';

export const getCRMContacts = async (page: number, search?: string): Promise<CRMContactsResponse> => {
  return await axiosInstance.get(`/api/contacts/v1/list/?page=${page}&page_size=${size}${search && "&search="+search}`)
}

export const addContact = async (
  data: FieldValues
): Promise<AddContactResponse> => {
  return await axiosInstance.post("/api/contacts/create/", data);
};

export const deleteContactById = async (id: string) => {
  return await axiosInstance.delete(`api/contacts/delete/${id}/`);
};

export const getContactById = async (
  id: string
): Promise<CRMContactByIdResponse> => {
  return await axiosInstance.get(`api/contacts/v1/view-details/${id}/`);
};

export const editContactById = async (
  id: string, editData: CRMContactEditFrom
): Promise<CRMContactByIdResponse> => {
  return await axiosInstance.put(`api/contacts/update/${id}/`, editData);
};

export const addContactNote = async (
  id: number,
  note: string
): Promise<Note> => {
  return await axiosInstance.post(`api/contacts/notes/${id}/create/`, { note });
};

export const getContactNotesById = async (
  id: string
): Promise<Note[]> => {
  return await axiosInstance.get(`api/contacts/v1/notes/${id}/list/`);
};


export const getCustomerQuotes = async (
  page: number,
  id: string,
  search: string,
  isSort: boolean,
  dateSearch: string,
): Promise<any> => {
    return axiosInstance.get(
      `/api/contacts/v1/view-quotes/${id}/?page=${page}&page_size=12&sort=${isSort ? "desc" : "asc"}&date=${dateSearch}${search ? `&search=${search}`: ""}`
    );
};

export const getCustomerInvoices = async (
  page: number,
  id: string,
  search: string,
  isSort: boolean,
  eventTypes: string[],
  dateSearch: string,
  
): Promise<any> => {
  const eventTypeQuery = eventTypes.map(type => `filter=${encodeURIComponent(type)}`).join('&');
    return axiosInstance.get(
      `/api/contacts/v1/view-invoices/${id}/?page=${page}&page_size=12&sort=${isSort ? "desc" : "asc"}&${eventTypeQuery}&date=${dateSearch}${search ? `&search=${search}`: ""}`
    );
};

export const getListDetails = async (
  pageView: string,
  page: number,
  id: string,
  search: string,
  isSort: boolean,
  dateSearch: string,
): Promise<any> => {
    return axiosInstance.get(
      `/api/contacts/v1/${pageView == "quote" ? 'view-quote-details': "view-invoice-details"}/${id}/?page=${page}&page_size=12&sort=${isSort ? "desc" : "asc"}&date=${dateSearch}${search ? `&search=${search}`: ""}`
    );
};
