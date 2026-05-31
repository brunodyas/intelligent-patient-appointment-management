"use client"
import React, { useEffect, useState } from "react";

import Ui7TableNew from "@/components/Ui7TableNew";
import { GetQueueCallsResponse } from "@/interface/phoneCall";
import { getQueueCalls } from "@/services/phoneCall";
import { useSelectCallCenter } from "@/context/callCenter";
import useFirstRender from "@/hooks/useFirstRender";
import { FranchiseProps } from "../page";
const QueuePage: React.FC<FranchiseProps> = ({ franchiseKey ,reFetch, handleRefetch }) => {
  const { callQueue, setCallQueue } = useSelectCallCenter();
  const {firstRender, reset} = useFirstRender()
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const [isSort, setIsSort] = useState(false);

  const [search, setSearch] = useState("");
  const [typeCheckbox, setTypeCheckbox] = useState<string[]>(["Waiting for Agent"]);
  const [cancelSearch, setCencelSearch] = useState("");
  const [dateSearch, setDateSearch] = useState<string>("");

  const fetchCallHistory = async (pageNumber: number | undefined) => {
    try {
      let pageForApi = pageNumber ? pageNumber : page;

      setLoading(true);
      let eventType = typeCheckbox || []; 
      const response = await getQueueCalls(pageForApi, search, isSort, dateSearch, franchiseKey);
      let callResults = response.results as GetQueueCallsResponse[];
  
      if (Array.isArray(callResults)) {
        setCallQueue(callResults);
        const totalRecords = response.count;
        setCount(totalRecords);
        setTotalPages(Math.ceil(totalRecords / 50));
      } else {
        console.error("Unexpected response format", callResults);
      }
    } catch (error) {
      console.error("Failed to fetch call queue data", error);
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
  }, [search, dateSearch, franchiseKey]); 

  const handleDateSearch = (date: string) => {
    setDateSearch(date);
  }

  const tableConfig = {
    tableName: "Queue",
    setIsSort,
    handleDateSearch,
    isSort,
    page,
    setPage,
    totalPages,
    count,
    typeCheckbox,
    setTypeCheckbox,
    search,
    setSearch,
    cancelSearch,
    noFilter: true,
    setCencelSearch,
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
        path: "timestamp",
        header: "Date",
        type: "date",
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
      time: {
        path: "timestamp",
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
      <Ui7TableNew data={callQueue} config={tableConfig} />
    </div>
  );
};
export default QueuePage;