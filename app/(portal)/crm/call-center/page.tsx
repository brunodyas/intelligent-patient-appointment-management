"use client";
import React, { useState } from "react";
import { UI7Tabs } from "@/components/UI7Tabs";
import CallHistoryPage from "./call-logs/Call-history";
import CallbackRequestsPage from "./call-back-requests/call-back-requests";
import VoiceMailPage from "./voice-mail/voice-mail";
import QueuePage from "./queue/queue";
import OngoingCallsPage from "./ongoing-calls/ongoing-calls";
import useUserRoles from "@/hooks/useUserRoles";
import CallCenterProvider from "@/context/callCenter";
import { parseCookies } from "nookies";
import { JWT } from "@/constants/enums/enums";
import { useAuth } from "@/context/auth";

export interface FranchiseProps {
  franchiseKey: string;
  reFetch: boolean;
  handleRefetch: () => void;
}

const CallLogs: React.FC<FranchiseProps> = ({ franchiseKey, reFetch, handleRefetch }) => {
  return <div><CallHistoryPage franchiseKey={franchiseKey} reFetch={reFetch} handleRefetch={handleRefetch}/></div>;
};

const CallbackRequests: React.FC<FranchiseProps> = ({ franchiseKey, reFetch, handleRefetch }) => {
  return <div><CallbackRequestsPage franchiseKey={franchiseKey} reFetch={reFetch} handleRefetch={handleRefetch} /></div>;
};

const Voicemails: React.FC<FranchiseProps> = ({ franchiseKey, reFetch, handleRefetch }) => {
  return <div><VoiceMailPage franchiseKey={franchiseKey} reFetch={reFetch} handleRefetch={handleRefetch} /></div>;
};

const Queue: React.FC<FranchiseProps> = ({ franchiseKey, reFetch, handleRefetch }) => {
  return <div><QueuePage franchiseKey={franchiseKey} reFetch={reFetch} handleRefetch={handleRefetch} /></div>;
};

const OngoingCalls: React.FC<FranchiseProps> = ({ franchiseKey, reFetch, handleRefetch }) => {
  return <div><OngoingCallsPage franchiseKey={franchiseKey} reFetch={reFetch} handleRefetch={handleRefetch} /></div>;
};

const CallCenterPage: React.FC = () => {
  const { isSuperAdmin, isCustomerCare, isAdmin, isCustomerCareManager } = useUserRoles();
  const [franchiseKey, setFranchiseKey] = useState<string>("");
  const [reFetch, setRefetch] = useState(false);

  const handleRefetch = () => {
    setRefetch((prev) => !prev);
  };

  const TabConfig = {
    tabs: [
      ...(isSuperAdmin || isCustomerCare || isCustomerCareManager ? [{ tabName: "Ongoing Calls", content: <OngoingCalls franchiseKey={franchiseKey} handleRefetch={handleRefetch} reFetch={reFetch} /> }] : []),
      { tabName: "Call Logs", content: <CallLogs franchiseKey={franchiseKey} handleRefetch={handleRefetch} reFetch={reFetch} /> },
      ...(isSuperAdmin || isCustomerCare || isCustomerCareManager ? [{ tabName: "Callback Requests", content: <CallbackRequests franchiseKey={franchiseKey} handleRefetch={handleRefetch} reFetch={reFetch} /> }] : []),
      { tabName: "Voicemails", content: <Voicemails franchiseKey={franchiseKey} handleRefetch={handleRefetch} reFetch={reFetch} /> },
      ...(isSuperAdmin || isCustomerCare || isCustomerCareManager ? [{ tabName: "Queue", content: <Queue franchiseKey={franchiseKey} handleRefetch={handleRefetch} reFetch={reFetch} /> }] : []),
    ],
  };
  const TabConfigFranchise = {
    tabs: [
      { tabName: "Show All Franchise Data", content: <></> },
      { tabName: "Current Franchise", content: <></> },
    ],
  };
  const { user } = useAuth();

  const handletabChange = (tabName: string) => {
    console.log(tabName);
    const cookies = parseCookies();
    const cookieValue = cookies[JWT];
    let franchise = user?.franchise;
    const { franchise_timezone } = JSON.parse(cookieValue);
    if (franchise_timezone) {
      const franchiseItem = localStorage.getItem("franchise");
      franchise = franchiseItem ? JSON.parse(franchiseItem) : null;
    }
    tabName == "Show All Franchise Data"
      ? setFranchiseKey("")
      : setFranchiseKey(franchise?.franchise_name || '');
  };

 

  return (
    <CallCenterProvider>
      <div className="call-history-page">
       {isSuperAdmin || isCustomerCare || isAdmin || isCustomerCareManager ? <UI7Tabs handletabChange={handletabChange}  config={TabConfigFranchise} /> : null}
        <br/>
        <UI7Tabs config={TabConfig} />
      </div>
    </CallCenterProvider>
  );
};

export default CallCenterPage;
