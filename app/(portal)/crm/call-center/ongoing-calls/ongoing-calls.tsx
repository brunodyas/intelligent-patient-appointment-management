"use client"
import React, { useEffect, useState } from "react";
import { GetCallHistoryResponse } from "@/interface/phoneCall";
import { getCallHistory } from "@/services/phoneCall";
import Ui7TableNew from "@/components/Ui7TableNew";
import { useSelectCallCenter } from "@/context/callCenter";
import useFirstRender from "@/hooks/useFirstRender";
import { FranchiseProps } from "../page";

const inititalStatus = [
  "Incoming Call",
  "Outbound Call",
  "Transferred",
  "On Hold",
  "In Progress",
  "Waiting for Agent",
  "Callee Answered",
  "Connected to Agent",
  "Voicemail Left",
];


const OngoingCallsPage: React.FC<FranchiseProps> = ({ franchiseKey,reFetch, handleRefetch }) => {
  const { ongoingCalls, setOngoingCalls } = useSelectCallCenter();
  const {firstRender, reset} = useFirstRender()
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const [isSort, setIsSort] = useState(false);
  const [search, setSearch] = useState("");
  const [typeCheckbox, setTypeCheckbox] = useState<string[]>(inititalStatus);
  const [cancelSearch, setCencelSearch] = useState("");
  const [dateSearch, setDateSearch] = useState<string>("");

  const fetchCallHistory = async (pageNumber: number | undefined) => {
    try {
      let pageForApi = pageNumber ? pageNumber : page;

      setLoading(true);
      let tableName = "Ongoing_Calls";
      let eventType = typeCheckbox || ""; 
      const response = await getCallHistory(pageForApi, eventType, search, isSort,dateSearch, franchiseKey, tableName);
      let callResults = response.results as GetCallHistoryResponse[];
  
      if (Array.isArray(callResults)) {
        setOngoingCalls(callResults);
        const totalRecords = response.count;
        setCount(totalRecords);
        setTotalPages(Math.ceil(totalRecords / 50));
      } else {
        console.error("Unexpected response format", callResults);
      }
    } catch (error) {
      console.error("Failed to fetch call history data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    !firstRender.current && fetchCallHistory(undefined);
    reset();
  }, [page, isSort, reFetch]); 


  useEffect(() => {
    fetchCallHistory(1);
  }, [typeCheckbox, search, cancelSearch, dateSearch, franchiseKey]); 

  const handleDateSearch = (date: string) => {
    setDateSearch(date);
  }
  const tableConfig = {
    tableName: "Ongoing Calls",
    page,
    setPage,
    handleDateSearch,
    totalPages,
    count,
    typeCheckbox,
    inititalStatus,
    setTypeCheckbox,
    search,
    setSearch,
    cancelSearch,
    setCencelSearch,
    setIsSort,
    isSort,
    handlePageChange: (newPage: number) => {
      setPage(newPage);
    },
    columns: {
      caller_number: {
        path: "caller_number",
        header: "Caller Number",
        type: "text",
        isPhoneNumber: true
      },
      recipient_number: {
        path: "recipient_number",
        header: "Recipient Number",
        type: "text",
        isPhoneNumber: true
      },
      franchise_name: {
        path: "franchise_name",
        header: "Franchise",
        type: "text",
      },
      Direction: {
        path: "direction",
        header: "Direction",
        type: "text",
      },
      date: {
        path: "start_time",
        header: "Date",
        type: "date",
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
      time: {
        path: "start_time",
        header: "Time",
        type: "time",
        render: (value: string) => new Date(value).toLocaleTimeString(),
      },
      event_type: {
        path: "current_status",
        header: "Status",
        type: "text",
      },
    },
  };
  return (
    <div className="call-history-page">
      <Ui7TableNew data={ongoingCalls} config={tableConfig} />
    </div>
  );
};
export default OngoingCallsPage;