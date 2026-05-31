interface CRMListActivity {
  id: number;
  activity_name: string;
  activity_type: string;
  due_date: string;
  assignedTo?: {
    id: number;
    name: string;
    email: string;
    photo?: File | null;
  };
  added_by: {
    id: number;
    name: string;
    email: string;
    photo?: File | null;
  };
  createdAt: string;
  completed: boolean;
}

export interface CRMActivitiesResponse {
  results?: CRMListActivity[];
  count: number;
  previous?: number;
  next?: number;
}

export interface AddActityResponse { }

export interface CRMActivityByIdResponse {
  id: number;
  assigned_to: string | null;
  added_by: {
    id: number;
    name: string;
    email: string;
    photo: File | null;
    franchise_timezone: string;
  };
  activity_name: string;
  activity_type: "Call" | "Deadline" | "Email" | "Meeting" | "Task";
  meeting_type: "Virtual" | "In Person";
  meeting_location: string | null;
  meeting_link: string | null;
  due_date: string;
  duration: string;
  completed: boolean;
  completed_date: string | null;
  updatedAt: string;
  createdAt: string;
  start_time: string | null;
  linked_franchise: number | null;
  linked_comapanies: number | null;
  linked_company: number | null;
  linked_contacts: number | null;
  job: any
}

export interface ActivitiesByDateRange {
  map(
    arg0: (activity: any) => { title: any; start: string; end: any; id: string }
  ): import("react").SetStateAction<Event[]>;
  id: number;
  activity_name: string;
  activity_type: string;
  due_date: string;
  duration: number;
  start_time: string | null;
  assigned_to: string | null;
  added_by: {
    id: number;
    name: string;
    email: string;
    photo: string | null;
  };
  createdAt: string;
  completed: boolean;
}

export interface DateFormat {
  year: number,
  month: number,
  day: number
}