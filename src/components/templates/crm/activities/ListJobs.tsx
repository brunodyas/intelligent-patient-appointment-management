"use client";

import UI8Table from "@/components/UI8Table";
import { CRMJobsResponse } from "@/interface/jobs";
import { getCRMJobs, getJobsOutOfService } from "@/services/jobs";
import { useCallback, useEffect, useRef, useState } from "react";
import { size } from "@/constants/constants";
import Button from "@/components/atomics/Button";
import { useAuth } from "@/context/auth";
import { useJune } from "@/hooks/useJune";
import useUserRoles from "@/hooks/useUserRoles";

type Props = {
  filterType?: "company" | "job" | "contact";
  filterId?: string;
  setSelectedJob?: (val: any) => void;
  selectedJob?: any;
  isSelectJob?: boolean;
};

const ListJobsActivity = ({
  filterType,
  filterId,
  selectedJob,
  setSelectedJob,
  isSelectJob = false,
}: Props) => {
  const { user } = useAuth();
  const [tableData, setTableData] = useState<CRMJobsResponse>();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [outOfServiceJobs, setOutOfServiceJobs] = useState<CRMJobsResponse>();

  const [outOfServiceJobsPage, setOutOfServiceJobsPage] = useState(1);
  const [outOfServiceJobstotalPages, setOutOfServiceJobsTotalPages] =
    useState(1);
  const analytics = useJune();
  const [search, setSearch] = useState("")
  const [searchOutOfService, setSearchOutOfService] = useState("")
  const timeoutRef = useRef<any>(null);
  
  const fetchJobs = useCallback(async (searchValue: string) => {
    try {
      const response = await getCRMJobs(+page, filterType, filterId, undefined, undefined, searchValue);
      analytics?.track("getCRMJobs");
      setTableData(response);
      setTotalPages(Math.ceil(response?.count / size));
    } catch (e) {
      console.error("Error fetching call list:", e);
    }
  }, [page]);

  const fetchOutOfServiceJobs = useCallback(async (searchValue?: string) => {
    try {
      const response = await getJobsOutOfService(+page, searchValue);
      analytics?.track("getJobsOutOfService");
      setOutOfServiceJobs(response);
      setOutOfServiceJobsTotalPages(Math.ceil(response?.count / size));
    } catch (e) {
      console.error("Error fetching call list:", e);
    }
  }, [outOfServiceJobsPage]);

  const handleSearchChange = useCallback((searchValue: string) => {
    if (timeoutRef) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchJobs(searchValue)
    }, 2000);
    setSearch(searchValue)
  }, [])

  const handleSearchOutofServiceChange = useCallback((searchValue: string) => {
    if (timeoutRef) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {
      fetchOutOfServiceJobs(searchValue)
    }, 2000);
    setSearchOutOfService(searchValue)
  }, [])

  useEffect(() => {
    if (page > 1) setPage(1)
  }, [search])

  useEffect(() => {
    if (outOfServiceJobsPage > 1) setOutOfServiceJobsPage(1)
  }, [searchOutOfService])

  useEffect(() => {
    fetchJobs(search);
  }, [page]);

  useEffect(() => {
    fetchOutOfServiceJobs(searchOutOfService);
  }, [outOfServiceJobsPage]);

  const tableConfig = {
    tableName: "List View",
    page,
    totalPages,
    search,
    handleSearchChange,
    handlePageChange: (page: number) => {
      setPage(page);
    },
    isAction: !isSelectJob,
    actionsColumn: (item: any) =>
      isSelectJob
        ? [
            <Button
              className="!py-[14px]"
              key={`select-company-${item.id}`}
              variant={
                selectedJob?.id === item.id ? "tab-selected" : "tab-unselect"
              }
              onClick={(e: any) => {
                e.stopPropagation();
                setSelectedJob && setSelectedJob(item);
              }}
            >
              Select
            </Button>,
          ]
        : [],
    pageUrl: "/crm/jobs",
    columns: {
      deal_name: { path: "job_name", header: "Deal Name", type: "string" },
      stage: { path: "stage", header: "Stage", type: "string" },
      appointment_date: {
        path: "consultation_date",
        header: "Appointment Date",
        type: "date",
      },
      status: { path: "status", header: "Status", type: "string" },
      owner: { path: "added_by_name", header: "Owner", type: "string" },
      contact_email: {
        path: "linked_contact_email",
        header: "Customer Email",
        type: "string",
      },
    },
    alerts: [],
    hideAddButton: true,
    hasNavigation: true,
  };

  const jobsOutOfServiceTableConfig = {
    tableName: "Unserviceable Jobs – Out Of Service Area",
    outOfServiceJobsPage,
    search:searchOutOfService,
    handleSearchChange: handleSearchOutofServiceChange,
    outOfServiceJobstotalPages,
    handlePageChange: (page: number) => {
      setOutOfServiceJobsPage(page);
    },
    pageUrl: "/crm/jobs",
    columns: {
      deal_name: { path: "job_name", header: "Deal Name", type: "string" },
      stage: { path: "stage", header: "Stage", type: "string" },
      appointment_date: {
        path: "consultation_date",
        header: "Appointment Date",
        type: "date",
      },
      status: { path: "status", header: "Status", type: "string" },
      owner: { path: "added_by.name", header: "Owner", type: "string" },
      contact_email: {
        path: "linked_contact.customer_email",
        header: "Customer Email",
        type: "string",
      },
    },
    alerts: [],
    hideAddButton: true,
    hasNavigation: true,
  };
  const { isSuperAdmin, isCustomerCare, isCustomerCareManager } = useUserRoles();


  return (
    <>
      {tableData && <UI8Table data={tableData?.results} config={tableConfig} />}
      {(outOfServiceJobs && (isSuperAdmin || isCustomerCare || isCustomerCareManager)) && (
        <UI8Table
          data={outOfServiceJobs?.results}
          config={jobsOutOfServiceTableConfig}
        />
      )}
    </>
  );
};

export default ListJobsActivity;