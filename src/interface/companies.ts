export interface NewCompany {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  industry: string;
  numberOfEmployees: string;
}

export interface CRMCompany {
  id: number;
  name: string;
  email: string;
  created_at: string;
  added_by: {
    id: number;
    name: string;
  };
}

export interface CRMCompanyByIdResponse {
  id: number,
  name: string,
  address: string,
  phone: string,
  email: string,
  website: string,
  num_employees: string,
  industry: string,
  created_at: string,
  updated_at: string,
  added_by: {
    id: number,
    name: string,
  }
}
export interface CRMCompanyEditForm {
  name: string,
  address: string,
  phone: string,
  email: string,
  website: string,
  num_employees: string,
  industry: string,
}

export interface CRMCompaniesResponse {
  results?: CRMCompany[];
  count: number;
  previous?: number;
  next?: number;
}

export interface AddCompanyResponse {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  num_employees: number;
  industry: string;
  created_at: string;
  updatedAt: string;
}

export interface CompanyFormInterface {
  name: string,
  email: string,
  phone: string,
  address: string,
  website: string,
  industry: string,
  num_employees: string,
}