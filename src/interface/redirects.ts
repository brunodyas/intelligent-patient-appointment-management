import { Option } from "./manufacturers";

export interface ListRedirectResponse {
  results?: any;
  count: number;
  previous?: number | null;
  next?: number | string | null;
}

export type RedirectsData = {
  twilio_number: string,
  number_type: string,
  redirect_number?: string,
  notification_emails: Option[],
  franchise?: {
    franchise_name: string;
    id: number
  } | number,
  uses_call_center?: boolean
}