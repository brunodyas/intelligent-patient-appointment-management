"use client"
import React, { useEffect, useMemo, useState } from "react";
import { GetCallHistoryResponse } from "@/interface/phoneCall";
import { getCallHistory, updateCallOverrideFranchise } from "@/services/phoneCall";
import Ui7TableNew from "@/components/Ui7TableNew";
import { useSelectCallCenter } from "@/context/callCenter";
import useFirstRender from "@/hooks/useFirstRender";
import { FranchiseProps } from "../page";
import { Button } from "@/components/atomics";
import FranchiseSelectBox from "@/components/atomics/franchiseSelectBox";
import useUserRoles from "@/hooks/useUserRoles";
import Spinner from "@/components/atomics/Spinner";

const inititalStatus = [
  "Completed",
  "Cancelled",
  "Incoming Call",
  "Outbound Call",
  "Transferred",
  "On Hold",
  "In Progress",
  "Waiting for Agent",
  "Connected to Agent",
  "Callback Requested",
  "Callee No Answer",
  "Callback Initiated",
  "Callee Answered",
  "Voicemail Left",
  "Ended by Agent",
];

const CallHistoryPage: React.FC<FranchiseProps> = ({ franchiseKey, reFetch, handleRefetch }) => {
  const { callHistoryData, setCallHistoryData } = useSelectCallCenter();
  const { isSuperAdmin, isCustomerCare, isCustomerCareManager } = useUserRoles();

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
  const [isEditCallHistory, setIsEditCallHistory] = useState(false);
  const [callFranchiseToEdit, setCallFranchiseToEdit] = useState<any>("");
  const [franchiseUpdateSubmitting, setFranchiseUpdateSubmitting] = useState('')

  const hasValidRole = useMemo(() => {
    return isSuperAdmin || isCustomerCare || isCustomerCareManager;
  }, [isSuperAdmin, isCustomerCare, isCustomerCareManager]);

  const fetchCallHistory = async (pageNumber: number | undefined) => {
    try {
      let pageForApi = pageNumber ? pageNumber : page;
      let tableName = "Call_Logs";
      setLoading(true);
      let eventType = typeCheckbox || []; 
      const response = await getCallHistory(pageForApi , eventType, search, isSort, dateSearch, franchiseKey, tableName);
      let callResults = response.results as GetCallHistoryResponse[];
  
      if (Array.isArray(callResults)) {
        setCallHistoryData(callResults);
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
    setPage(1);
    fetchCallHistory(1);
  }, [typeCheckbox, search, cancelSearch, dateSearch, franchiseKey]);

  const handleDateSearch = (date: string) => {
    setDateSearch(date);
  }

  const handleOverrideFranchise = (call: string, index: number) => {
    console.log("Call to edit", call);
    setCallFranchiseToEdit(call);
    setIsEditCallHistory(true);
  }

  const handleFranchiseChange = (franchise: any) => {
    setCallFranchiseToEdit((prev: any) => {
      return {
        ...prev,
        franchise_id: franchise.id,
        new_franchise_name: franchise.franchise_name,
      }
    })
  }

  const handleFranchiseSubmit = async (callSid: string, franchiseId?: string) => {
    try {
        const updatedFranchise : any = await updateCallOverrideFranchise({ callSid, franchiseId: franchiseId || '' });
        console.log("Franchise updated successfully", updatedFranchise.franchise_name);
    } catch (error) {
        console.error("Error updating franchise", error);
    } finally {
        handleRefetch();
        setIsEditCallHistory(false);
        setFranchiseUpdateSubmitting('')
    }
};


  const tableConfig = {
    tableName: "Call Logs",
    setIsSort,
    handleDateSearch,
    isSort,
    page,
    setPage,
    totalPages,
    count,
    typeCheckbox,
    inititalStatus,
    setTypeCheckbox,
    search,
    setSearch,
    cancelSearch,
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
      duration: {
        path: "duration",
        header: "Duration",
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
    ...(hasValidRole && {actionsColumn: (item: any, index: number) => [
      <Button
        key={`select-contact-${item.id}`}
        size="md"
        variant="default-bg"
        className="mr-4 !w-11"
        onClick={(e: any) => {
          e.stopPropagation();
          handleOverrideFranchise(item, index);
          
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.79289 13.4999H3C2.86739 13.4999 2.74021 13.4472 2.64645 13.3535C2.55268 13.2597 2.5 13.1325 2.5 12.9999V10.207C2.5 10.1414 2.51293 10.0764 2.53806 10.0157C2.56319 9.95503 2.60002 9.89991 2.64645 9.85348L10.1464 2.35348C10.2402 2.25971 10.3674 2.20703 10.5 2.20703C10.6326 2.20703 10.7598 2.25971 10.8536 2.35348L13.6464 5.14637C13.7402 5.24014 13.7929 5.36732 13.7929 5.49992C13.7929 5.63253 13.7402 5.75971 13.6464 5.85348L6.14645 13.3535C6.10002 13.3999 6.0449 13.4367 5.98424 13.4619C5.92357 13.487 5.85855 13.4999 5.79289 13.4999Z"
            stroke="#3B4453"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 4L12 7.5"
            stroke="#3B4453"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.96848 13.4675L2.53223 10.0312"
            stroke="#3B4453"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>,
    ]}),
    modals: [
      {
        title: "Override Franchise",
        className: "max-w-sm",
        open: isEditCallHistory,
        setOpen: setIsEditCallHistory,
        modalChild: (
          <>
            <main className="mb-10 mt-4">
              <FranchiseSelectBox defaultSelected={callFranchiseToEdit?.franchise_name} onChange={handleFranchiseChange}/>
            </main>
            <footer className="flex w-full justify-end gap-3">
              <Button
                className="!h-10"
                size="md"
                disabled={!callFranchiseToEdit?.is_franchise_overridden || franchiseUpdateSubmitting.includes('remove')}
                variant={callFranchiseToEdit?.is_franchise_overridden ? "error-bg" : "disabled-bg"}
                onClick={() => {
                  setFranchiseUpdateSubmitting('remove')
                  handleFranchiseSubmit(callFranchiseToEdit?.id);
                }}
              >
                {franchiseUpdateSubmitting.includes('remove') && <Spinner />}
                Remove
              </Button>
              <Button
                className="!h-10"
                size="md"
                disabled={!callFranchiseToEdit?.franchise_id || callFranchiseToEdit?.franchise_name == callFranchiseToEdit?.new_franchise_name || franchiseUpdateSubmitting.includes('save')}
                variant={callFranchiseToEdit?.franchise_id || callFranchiseToEdit?.franchise_name != callFranchiseToEdit?.new_franchise_name ? "primary-bg" : "disabled-bg" }
                onClick={() => {
                  setFranchiseUpdateSubmitting('save')
                  handleFranchiseSubmit(callFranchiseToEdit?.id, callFranchiseToEdit?.franchise_id);
                }}
              >
                {franchiseUpdateSubmitting.includes('save') && <Spinner />}
                Save
              </Button>
            </footer>
          </>
        ),
      },
    ],
  };
  return (
    <div className="call-history-page">
      <Ui7TableNew data={callHistoryData} config={tableConfig} />
    </div>
  );
};
export default CallHistoryPage;