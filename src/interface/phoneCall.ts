export interface TwilioTokenResponse {
  token: string;
  signed_be_token: string;
  identity: string;
}

export interface GetCallerNumberResponse {
  number: string;
  caller_name: string | null;
}

export interface UpdateCallParams {
  call_sid: string;
  action: CallAction;
  new_agent_identity?: string,
}

export interface EndCallParams {
  call_sid: string;
}

export enum CallAction {
  Hold = "hold",
  Resume = "resume",
  Transfer = "transfer_to_agent",
}

export interface Calls {
  id: number;
  sid: string;
  caller_number: string;
  start_time: string;
  end_time?: string;
  current_status: string;
}

export interface CallEvent {
  id: number;
  event_type: string;
  timestamp: string;
  agent?: {
    id: number;
    name: string;
    email: string;
    photo: File | null;
  };
  notes?: string;
}

export interface ListCallsResponse {
  results: Calls[];
  count: number;
  previous?: number;
  next?: number;
}

///mk changing
export interface GetCallHistoryResponse {
  counts: number;
  next: string;
  previous: string;
  results: [];
  count: number;
  currentPage: number;
  search: string;
}

export interface GetCallbackRequestsResponse {
  count: number;
  next: string;
  previous: string;
  results: any;
}

export interface VoiceMailsResults {
  caller_number: string;
  twilio_number: string;
  recording_url: string;
}
export interface GetVoiceMailsResponse {
  count: number;
  next: string;
  previous: string;
  results: [];
}

export interface CheckAgentStatusResponse {
  status: number;
  identity: string;
}

export interface GetQueueCallsResponse {
  counts: number;
  next: string;
  previous: string;
  results: [];
  count: number;
  currentPage: number;
  search: string;
}

export interface UpdateCallParamsSecond {
  call_sid: string;
  identity: String;
}
