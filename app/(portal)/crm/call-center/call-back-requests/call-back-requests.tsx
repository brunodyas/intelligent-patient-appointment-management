"use client";
import React, { useEffect, useState } from "react";
import { GetCallbackRequestsResponse } from "@/interface/phoneCall";
import { getCallbackRequests, updateCallbackRequestIsCallbackTrue } from "@/services/phoneCall";
import Ui6Table from "@/components/UI6Table";
import { Button } from "@/components/atomics";
import { useAuth } from "@/context/auth";
import { useCall } from "@/context/callContext";
import { useSelectCallCenter } from "@/context/callCenter";
import useFirstRender from "@/hooks/useFirstRender";
import { FranchiseProps } from "../page";

const CallbackRequestsPage: React.FC<FranchiseProps> = ({ franchiseKey,reFetch, handleRefetch }) => {
  const { makeCall } = useCall();
  const { callBacks, setCallBacks } = useSelectCallCenter();
  const {firstRender, reset} = useFirstRender()

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const [isSort, setIsSort] = useState(false);
  const [search, setSearch] = useState("");
  const [typeCheckbox, setTypeCheckbox] = useState<string>("");
  const [cancelSearch, setCancelSearch] = useState("");
  const [dateSearch, setDateSearch] = useState<string>("");
  const { user } = useAuth();
  const is_busy = user?.is_busy ?? false;
  const twilio_device_active = user?.twilio_device_active ?? false;


  const fetchCallBackRequests = async (pageNumber: number | undefined) => {
    try {
      let pageForApi = pageNumber ? pageNumber : page;
      setLoading(true);
      const response = await getCallbackRequests(pageForApi, isSort, search, dateSearch, franchiseKey);
      let callResults = response.results as GetCallbackRequestsResponse[];

      if (Array.isArray(callResults)) {
        setCallBacks(callResults);
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
    !firstRender.current && fetchCallBackRequests(undefined);
    reset();
  }, [page, isSort, reFetch]);

  useEffect(() => {
    setPage(1);
    fetchCallBackRequests(1);
  }, [typeCheckbox, search, cancelSearch, dateSearch, franchiseKey]);
  

  const handleCallbackRequest = async (id: string, index: number) => {
    try {
      await makeCall(callBacks[index].twilio_number);
      
      setCallBacks((prevData: any) => {
        const newData = [...prevData];

        if (newData[index]) { 
          newData.splice(index, 1);
        }
      
        return newData;
      });
      
  
      const response = await updateCallbackRequestIsCallbackTrue(+id);
    } catch (error) {
      console.error("Error handling callback request:", error);
    }
  };
  const handleDateSearch = (date: string) => {
    setDateSearch(date);
  }
  const tableConfig = {
    tableName: "CallBack Requests",
    page,
    setPage,
    totalPages,
    count,
    typeCheckbox,
    setTypeCheckbox,
    search,
    setSearch,
    cancelSearch,
    setCancelSearch,
    isSort,
    setIsSort,
    handleDateSearch,
    handlePageChange: (newPage: number) => {
      setPage(newPage);
    },
    columns: {
      Caller_Number: {
        path: "caller_number",
        header: "Caller Number",
        type: "text",
        isPhoneNumber: true
      },
      Twilio_Number: {
        path: "twilio_number",
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
      Request_Date: {
        path: "request_time",
        header: "Date",
        type: "date",
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
      Request_time: {
        path: "request_time",
        header: "Time",
        type: "time",
        render: (value: string) => new Date(value).toLocaleTimeString(),
      },
      Voice_Mail: {
        path: "id",
        header: "Voice Mails",
        type: "custom",
        render: (id: string, index: string) => (
          <Button
            size="md"
            variant={
              !is_busy && twilio_device_active ? "primary-bg" : "disabled-bg"
            }
            disabled={is_busy || !twilio_device_active}
            onClick={() => handleCallbackRequest(id, +index)}
          >
            Callback
          </Button>
        ),
      },
    },
  };

  return (
    <div className="call-history-page">
      <Ui6Table data={callBacks} config={tableConfig} />
    </div>
  );
};

export default CallbackRequestsPage;
