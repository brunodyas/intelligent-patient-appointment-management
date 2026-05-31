import { FieldValues } from "react-hook-form";
import axiosInstance from "../lib/axios";
import tempAxiosInstance from "@/lib/tempAxios";
import {
  TwilioTokenResponse,
  UpdateCallParams,
  ListCallsResponse,
  EndCallParams,
  GetCallHistoryResponse,
  CheckAgentStatusResponse,
  GetQueueCallsResponse,
  UpdateCallParamsSecond,
  GetCallbackRequestsResponse,
  GetVoiceMailsResponse,
  GetCallerNumberResponse,
} from "@/interface/phoneCall";

import { size } from "@/constants/constants";

export const getTwilioToken = async (): Promise<TwilioTokenResponse> => {
  return await axiosInstance.get('/api/call/get_token/')
}

export const updateCall = async ({
  call_sid,
  action,
  new_agent_identity,
}: UpdateCallParams) => {
  return await axiosInstance.post("/api/call/update-call/", {
    call_sid,
    action,
    ...(new_agent_identity && { new_agent_identity }), // Only includes if truthy
  });
};

export const endCall = async ({ call_sid }: EndCallParams) => {
  return await axiosInstance.post("/api/call/end-call-view/", {
    call_sid,
  });
};

export const getCallList = async (page: number): Promise<ListCallsResponse> => {
  return await axiosInstance.get(
    `/api/call/list/?page=${page}&page_size=${size}`
  );
};

//function to fetch call history from api
export const getCallHistory = async (
  page: number,
  eventTypes: string[],
  search: string,
  isSort: boolean,
  dateSearch: string,
  franchiseKey: string,
  tableName: string
): Promise<GetCallHistoryResponse> => {
  const eventTypeQuery = eventTypes.map(type => `event_type=${encodeURIComponent(type)}`).join('&');
  return await axiosInstance.get(
    `/api/call/call-history/?page=${page}&page_size=50&${eventTypeQuery}&search=${search}&sort=${isSort ? 'acs' : 'desc'}&date=${dateSearch}&franchise=${franchiseKey}&table_name=${tableName}`
  );
};


//function to post status on api
export const checkAgentstatus = async (
  status: boolean,
  identity: string
): Promise<CheckAgentStatusResponse> => {
  return await axiosInstance.post(
    `/api/call/status/check-agent-status/?status=${status}&id=${identity}`
  );
};


//function to get queue calls
export const getQueueCalls = async (
  page: number,
  search: string,
  isSort: boolean,
  dateSearch: string,
  franchiseKey: string,
): Promise<GetQueueCallsResponse> => {

  return await axiosInstance.get(
    `/api/call/call-queue/?page=${page}&page_size=50&search=${search}&sort=${isSort ? 'asc' : 'desc'}&date=${dateSearch}&franchise=${franchiseKey}`
  );
};

// function to get callback requests
export const getCallbackRequests = async (
  page: number,
  isSort: boolean,
  search: string,
  dateSearch: string,
  franchiseKey: string
): Promise<GetCallbackRequestsResponse> => {
  return await axiosInstance.get(
    `/api/call/callback-request/?page=${page}&page_size=50&sort=${isSort ? 'asc' : 'desc'}&search=${search}&date=${dateSearch}&franchise=${franchiseKey}`
  );
};

export const updateCallbackRequestIsCallbackTrue = async (
  id: number
): Promise<GetCallbackRequestsResponse> => {
  return await axiosInstance.put(
    `/api/call/update-callback/${id}/`,
  );
};

// export const getCallbackRequests = async (page : number ): Promise<GetCallbackRequestsResponse> => {
//   return await axiosInstance.get(`/api/call/callback-request/?page=${page}&page_size=50`, {
//     headers: {
//       'ngrok-skip-browser-warning': 'true',
//     },
//   })
// }

// function to get voicemails
export const getVoiceMails = async (
  page: number,
  dateSearch: string,
  search: string,
  isSort: boolean,
  franchiseKey: string
): Promise<GetVoiceMailsResponse> => {
  return await axiosInstance.get(
    `api/call/voicemails-request/?page=${page}&page_size=50&date=${dateSearch}&search=${search}&sort=${
      isSort ? "asc" : "desc"
    }&franchise=${franchiseKey}`
  );
};

// export const getVoiceMails = async (page : number ): Promise<GetVoiceMailsResponse> => {
//   return await axiosInstance.get(`/api/call/voicemails-request/?page=1&page_size=50`, {
//     headers: {
//             'ngrok-skip-browser-warning': 'true',
//           },
//         })
//       }

//

export const getCallerNumber = async (callSid: string): Promise<GetCallerNumberResponse> => {
    return await tempAxiosInstance.get(`/api/call/get-customer-num-by-sid/${callSid}/`);
};

export const updateCallOverrideFranchise = async ({
  callSid,
  franchiseId,
}: {
  callSid: string;
  franchiseId: string;
}) => {
  return await axiosInstance.patch(
    `/api/call/update-call-franchise/${callSid}/?franchise_id=${franchiseId}`
  );
};

