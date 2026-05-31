import { CRMCompany, NewCompany } from "./companies";

export interface User {
  id: number;
  name: string;
}

export interface NewContact {
  id?: number;
  contact_name: string;
  customer_email: string;
  phone: string;
  customer_address?: string;
  source: string;
  linked_company?: NewCompany | CRMCompany
}

export interface CRMContact {
  id: number;
  contact_name: string;
  customer_email: string;
  createdAt: string;
  added_by: User
}

export interface DefaultFormData {
  contact_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  source: string;
  linked_company?: string;
  bypass_validation: string;
}

export interface CRMContactsResponse {
  results?: CRMContact[];
  count: number;
  previous?: number;
  next?: number;
}

export interface AddContactResponse {
  id: number;
  contact_name: string;
  source: string;
  customer_email: string;
  customer_phone: string;
  cusotmer_address: string;
  createdAt: string;
  updatedAt: string;
  linked_company: number | null;
  contact_postion: string | null;
}

export interface CRMContactByIdResponse {
  id: number;
  contact_name: string;
  source: string; //limit to two choices
  customer_email: string;
  customer_phone: string | null;
  customer_address: string;
  createdAt: string;
  updatedAt: string;
  added_by: User;
  linked_company: number;
  contact_position: string | null;
}
export interface CRMContactEditFrom {
  contact_name: string;
  source: string; //limit to two choices
  customer_email: string;
  customer_phone: string | null;
  customer_address: string;
  added_by: User;
  linked_company: number | null;
  contact_position: string | null;
}

export interface Note {
  id: number;
  note: string;
  contact: number;
  createdAt: string;
  updatedAt: string;
  added_by?: User;
}