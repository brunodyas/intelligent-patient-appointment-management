import dynamic from 'next/dynamic';
const Route = dynamic(() => import('@/components/atomics/Route'), {
  ssr: false,
});
import { routes } from '@/constants/routes';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@relume_io/relume-ui';
import { Fragment } from 'react';
import formatDate from '@/utils/formatDate';
import serverAxiosInstance from '@/lib/serverAxios';
import { formatPhoneNumber } from '@/utils/formatPhoneForCall';
const CallDetailTableNew = dynamic(() => import('@/components/CallDetailTable'), {
  ssr: false,
});

interface Params {
  callId: string,
}

export default async function MyPage({ params }: { params: Params }) {
  const { callId } = params
  const {call_detail: callDetail, voicemails, recordings, events}: any = await fetchCallDetails(callId);

  console.log(callDetail, voicemails, recordings, events);

  const callInfo = {
    "Call ID": callDetail?.id || "--",
    "SID": callDetail?.sid || "--",
    "Caller Name": callDetail?.caller_name || "--",
    "franchise": callDetail?.franchise_name || "--",
    "Caller Number": (callDetail?.caller_number && formatPhoneNumber(callDetail?.caller_number, true)) || "--",
    "Recipient Number": (callDetail?.recipient_number && formatPhoneNumber(callDetail?.recipient_number, true)) || "--",
    "Direction": callDetail?.direction || "--",
    "Start Time": formatDate(callDetail?.start_time) ?? "--",
    "End Time": formatDate(callDetail?.end_time) ?? "--",
    "Status": callDetail?.current_status || "--",
    "Duration": callDetail?.duration ? `${callDetail?.duration} minutes` : "--",
  };

  const voicemailsTableConfig = {
    tableName: "Voicemails",
    columns: {
      Caller_Number: {
        path: "caller_number",
        header: "Caller Number",
        type: "text",
      },
      Twilio_Number: {
        path: "twilio_number",
        header: "Recipient Number",
        type: "text",
      },
      date: {
        path: "formattedDate",
        header: "Date",
        type: "text",
      },
      time: {
        path: "formattedTime",
        header: "Time",
        type: "text",
      },
      Voice_Mail: {
        path: "recording_stored_url",
        header: "Voice",
        type: "audio", 
      },
      
    },
  };
  
  const formattedVoicemails = voicemails && voicemails?.map((voicemail: any) => ({
    ...voicemail,
    formattedDate: new Date(voicemail?.created_at).toLocaleDateString(),
    formattedTime: new Date(voicemail?.created_at).toLocaleTimeString(),
  }));


  const eventsTableConfig = {
    tableName: "Events",
    columns: {
      Caller_Number: {
        path: "event_type",
        header: "Event Type",
        type: "text",
      },
      Twilio_Number: {
        path: "notes",
        header: "Notes",
        type: "text",
      },
      date: {
        path: "formattedDate",
        header: "Date",
        type: "text",
      },
      time: {
        path: "formattedTime",
        header: "Time",
        type: "text",
      },
      
    },
  };
  
  const formattedEvents = events && events?.map((voicemail: any) => ({
    ...voicemail,
    formattedDate: new Date(voicemail?.timestamp).toLocaleDateString(),
    formattedTime: new Date(voicemail?.timestamp).toLocaleTimeString(),
  }));
  
  const recordingTableConfig = {
    tableName: "Recordings",
    columns: {
      Caller_Number: {
        path: "recording_sid",
        header: "Recording SID",
        type: "text",
      },
      Twilio_Number: {
        path: "recording_duration",
        header: "Duration",
        type: "text",
      },
      date: {
        path: "formattedDate",
        header: "Date",
        type: "text",
      },
      time: {
        path: "formattedTime",
        header: "Time",
        type: "text",
      },
      Voice_Mail: {
        path: "recording_stored_url",
        header: "Voice",
        type: "audio", 
      },
      
    },
  };
  
  const formattedRecordings = recordings && recordings?.map((voicemail: any) => ({
    ...voicemail,
    formattedDate: new Date(voicemail?.created_at).toLocaleDateString(),
    formattedTime: new Date(voicemail?.created_at).toLocaleTimeString(),
  }));

  return (
    <Fragment key={callDetail?.id}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Route
              route={`${routes.crmCallHistory}`}
              linkClassName="text-neutral-500 hover:cursor-pointer"
            >
              Call Center
            </Route>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-[#707070]" />
          <BreadcrumbItem>
            <BreadcrumbLink className="text-neutral-black font-medium cursor-auto">
              {callDetail?.id}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="py-4">
        <div className="container w-full">
          <div className="border rounded-md px-6 py-5 max-sm:p-3">
            <p className="font-semibold text-md sm:text-lg">
              Call Information
            </p>
            <div className="grid gap-4 grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 py-5 text-sm">
              {Object.entries(callInfo).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <p className="text-gray-600">{key}</p>
                  <p className={key === "Caller Number" || key === "Recipient Number" || key === "Status" || key === "franchise" ? "text-pink-500" : ""}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <CallDetailTableNew config={voicemailsTableConfig} data={formattedVoicemails}/>
      <CallDetailTableNew config={eventsTableConfig} data={formattedEvents}/>
      <CallDetailTableNew config={recordingTableConfig} data={formattedRecordings}/>

    </Fragment>
  );
}

async function fetchCallDetails(id: string) {
  try {
    const res = await serverAxiosInstance.get(`/api/call/call-history-detail/${id}/`);

    if (!res) {
      console.error(`Failed to fetch call ${id} details`);
      return null;
    }
    return res.data || '';
  } catch (error) {
    console.error(`Failed to fetch call ${id} details`, error);
    return {call_detail: '', voicemails: '', recordings: '', events: ''};
  }
}
