import { Option } from "./manufacturers";

interface Franchise {
  id: number,
  franchise_name: string;
}

export type EditFranchiseData = {
  email: string,
  franchise_name: string,
  website_url:string,
  franchise_active: string,
  // is_manufacturer: string,
  // price_markup: string,
  franchise_address: string,
  zip_codes_covered: Option[],
  zip_codes_would_accept_outside_owned: Option[],
}

export interface ListFranchisesResponse {
  results?: Franchise[];
  count: number;
  previous?: number;
  next?: number;
}