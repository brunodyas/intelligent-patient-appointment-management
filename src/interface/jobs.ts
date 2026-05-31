import { PAYMENT_STATUS_CHOICES } from "@/constants/enums/invoice";

export interface CRMJob {
  id: number;
  job_name: string;
  customer_description: string | null;
  technician_notes: string | null;
  pipeline: "CONSULTATION" | "REPAIRS";
  stage: "NEW" | "DIAGNOSE" | "IN PROGRESS" | "COMPLETED" | "CONSULTATION" | "ORDERED" | "INSTALLATION";
  consultation_date: string;
  status: "PENDING" | "ACTIVE" | "FAILED" | "COMPLETED" | "CANCELLED"
  cal_meeting_id: number | null;
  linked_contact: {
    id: number;
    contact_name: string;
    source: string;
    customer_email: string;
    customer_phone: string | null;
    customer_address: string;
    createdAt: string;
    updatedAt: string;
    customer_address_coordinates: string;
  },
  added_by: {
    id: number,
    name: string,
    email: string,
    photo: File | null,
    tech_vehicle: string,
    tech_license_plate: string
  },
  assigned_Driver: {
    email: string;
    id: number;
    name: string;
    photo: string | null;
    tech_license_plate: string;
    tech_vehicle: string;
  } | null;
  first_invoice_id: string | null;
  first_invoice_paid: boolean;
  second_invoice_id: string | null;
  second_invoice_paid: boolean;
  createdAt: string;
  updatedAt: string;
  productConfigs: string[];
  activities: string[];
  questions_for_technician_to_ask: string;
  payment_status: PAYMENT_STATUS_CHOICES.NOT_STARTED |
  PAYMENT_STATUS_CHOICES.AWAITING_DOWN_PAYMENT |
  PAYMENT_STATUS_CHOICES.AWAITING_FINAL_PAYMENT |
  PAYMENT_STATUS_CHOICES.PAYMENT_COMPLETE;
  invoice_steps_not_started: boolean,
  can_generate_final_payment: boolean,
  total_invoice_amount: number
}

export interface CRMTech {
  id: number;
  name: string;
  photo: string | null; //change to file later
  role: string;
  tech_vehicle: string;
  tech_license_plate: string;
  availability?: string;
  user_color?: string | null;
}

export interface CRMJobTechsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CRMTech[]
}

export interface CRMJobsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CRMJob[]
}

export interface InvoiceInterface {
  id: string | null;
  amount: string;
  status: string;
}

export interface DetermineFranchiseResponse {
  franchise_id?: number;
  message: string;
}


export interface NewJob {
  job_name: string;
  pipeline: string;
  stage: string;
  consultation_date?: string;
  start_time?: string;
  status: string;
  linked_contact: number | null;
  customer_description: string;
};