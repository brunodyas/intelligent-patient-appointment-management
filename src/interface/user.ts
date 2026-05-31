export interface UserInterFace {
  google_refresh_token: any;
  google_access_token: any;
  google_mail: any;
  id: string;
  name: string; //make first name and last name
  email: string;
  user_phone: string | null; //change to phone
  franchise: {
    id: number;
    franchise_name: string;
    // price_markup: string;
    franchise_active: boolean;
    primary_number:{
      twilio_number: string;
      redirect_number: string;
    }
  }
  is_busy: boolean;
  twilio_device_active: boolean;
  photo: string | null;
  role: string;
  shift_start_time: string | null;
  shift_end_time: string | null;
  tech_license_plate?: string;
  tech_vehicle?: string;
  early_access: boolean;
}

export interface UserResponse {
  data: { user: UserInterFace; message: string };
  message: string;
}

export interface UserLoginResponse {
  token: string;
  user: UserInterFace;
  message: string;
}

export interface FranchiseUserLoginResponse {
  franchise_token: string;
  user: UserInterFace;
  message: string;
}

export interface UserForgotPasswordResponse {
  data: { result: string };
  message: string;
}

export interface UpdatePasswordResponse {
  data: { message: string };
  message: string;
}

export interface AddUserFranchiseResponse {
  name: string;
  email: string;
  user_phone: string;
  photo: string;
  role: string;
  password: string;
  franchise_id: number;
}


export interface Franchise {
  id: number;
  franchise_name: string;
  // price_markup?: string | null;
  franchise_active: boolean;
  // is_manufacturer: boolean;
}

export interface UserDetailsResponse {
  id?: number;
  name: string;
  email: string;
  user_phone?: string | null;
  franchise: Franchise;
  photo?: string | null;
  role: string;
}

export interface UserListResponse {
  results?: User[];
  count: number;
  previous?: number;
  next?: number;
  searchValue?: string;
}

export interface User {
  id: number;
  name: string;
  photo: string | null;
  role: string;
  tech_vehicle: string;
  tech_license_plate: string;
}

export interface UserListDetails {
  tech_num_active_deliveries: number;
  tech_num_completed_deliveries: number;
  id: number;
  name: string;
  email: string;
  user_phone: string | null;
  franchise?: {
    id: number;
    franchise_name: string;
    // price_markup: string;
    franchise_active: boolean;
    // is_manufacturer: boolean;
    website_url: string;
    zip_codes_covered: string | string[];
    zip_codes_would_accept_outside_owned: string | string[]
    franchise_address: string;
  };
  photo?: string | null;
  role: string;
  tech_vehicle: string;
  tech_license_plate: string;
  shift_end_time: string | null;
  shift_start_time: string | null;
}

export interface UserData {
  name: string;
  email: string;
  password?: string;
  photo: string;
  user_phone: string;
  role: string;
  tech_license_plate: string;
  tech_vehicle: string;
  shift_end_time: string,
  shift_start_time: string,
}