"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import getWebSocketUrl from "@/utils/getWebSocketUrl";
import useWebSocket from "@/utils/websocket";
import { useAuth } from "./auth";

interface CallCenterContextType {
  ongoingCalls: any;
  setOngoingCalls: (ongoingCalls: any) => void;
  callBacks: any[];
  setCallBacks: (callBacks: any) => void;
  callHistoryData: any[];
  setCallHistoryData: (callHistory: any) => void;
  callQueue: any[];
  setCallQueue: (callQueue: any) => void;
  callVoicemail: any[];
  setCallVoicemail: (callVoicemail: any) => void;
}

const CallCenterContext = createContext<CallCenterContextType | undefined>(undefined);

const CallCenterProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user, token, fetchUserDetails } = useAuth();
  const [ongoingCalls, setOngoingCalls] = useState<any[]>([]);
  const [callBacks, setCallBacks] = useState<any[]>([]);
  const [callHistoryData, setCallHistoryData] = useState<any[]>([]);
  const [callQueue, setCallQueue] = useState<any[]>([]);
  const [callVoicemail, setCallVoicemail] = useState<any[]>([]);

  const backendUrl = process.env.NEXT_PUBLIC_BE_URL;
  const wsUrl = backendUrl ? getWebSocketUrl(backendUrl) : "";

  const handleNewNotification = (data: any) => {
    console.log("Sockets => ", data);
    if (data.type === "callback.list") {
      switch (data.event) {
        case "callback-upsert":
          setCallBacks(data.data);
          break;
        case "call-upsert":
          setCallHistoryData(data.data);
          break;
        case "call-ongoing":
          setOngoingCalls(data.data);
          break;
        case "call-queue":
          setCallQueue(data.data);
          break;
        case "call-voicemail":
          setCallVoicemail(data.data);
          break;
        default:
          console.warn(`Unexpected event type: ${data.event}`);
          break;
      }
    }
  };

  const { send } = useWebSocket(
    `${wsUrl}/ws/callbacks/`,
    handleNewNotification,
    !!user
  );

  return (
    <CallCenterContext.Provider
      value={{
        ongoingCalls,
        setOngoingCalls,
        callBacks,
        setCallBacks,
        callHistoryData,
        setCallHistoryData,
        callQueue,
        setCallQueue,
        callVoicemail,
        setCallVoicemail,
      }}
    >
      {children}
    </CallCenterContext.Provider>
  );
};

export const useSelectCallCenter = () => {
  const context = useContext(CallCenterContext);
  if (context === undefined) {
    throw new Error(
      "useSelectCallCenter must be used within a CallCenterProvider"
    );
  }
  return context;
};

export default CallCenterProvider;
