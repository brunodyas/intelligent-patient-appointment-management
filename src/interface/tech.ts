interface LinkedContact {
  id: number;
  contact_name: string;
  source: string;
  customer_email: string;
  customer_phone: string | null;
  customer_address: string;
  createdAt: string;
  updatedAt: string;
  customer_address_coordinates: string | null;
}

interface Person {
  id: number;
  name: string;
  email: string;
  photo: string | null;
  tech_vehicle: string;
  tech_license_plate: string;
}

interface Appointment {
  id: number;
  job_name: string;
  pipeline: string;
  stage: string;
  consultation_date: string;
  status: string;
  linked_contact: LinkedContact;
  added_by: Person;
  assigned_Driver: Person;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentResponse{
  count: number;
  results: Appointment[];
  next: string | null;
  previous: string | null;
}


export interface Appointments {
  id: string,
  name: string,
  pipeline: string,
  address: string,
  created_at: string,
  assigned_Driver?: {id: number, name: string},
  status: string,
  latitude: string | undefined,
  longitude: string | undefined
}