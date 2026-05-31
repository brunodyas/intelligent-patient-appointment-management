export interface CRMDocuments {
  id: number,
  file_name: string;
  file: string;
  linked_job: number;
  added_by: {
    id: number;
    name: string;
    email: string;
    photo: string | null
  };
  added_date: string
}

export interface CRMDocumentsResponse {
  results?: CRMDocuments[];
  count: number;
  previous?: number;
  next?: number;
}

export interface CRMDocumentByIdResponse {
  file_name: string;
  linked_job: any;
  added_by: {
    id: number;
    name: string;
    email: string;
    photo: string | null;   
    franchise_timezone: string; 
  },
  added_date: string;
  file: string;
  linked_contacts: number | null;
  linked_company:  number | null;
}