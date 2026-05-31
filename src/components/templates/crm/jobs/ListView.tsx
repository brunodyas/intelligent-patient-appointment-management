"use client";

import UI8Table from "@/components/UI8Table";
import { CRMJobsResponse } from "@/interface/jobs";
import { getCRMJobs, getJobsOutOfService } from "@/services/jobs";
import { Dispatch, memo, useCallback, useEffect, useRef, useState } from "react";
import { size } from "@/constants/constants";
import Button from "@/components/atomics/Button";
import { useAuth } from "@/context/auth";
import { useJune } from "@/hooks/useJune";
import { Text } from "@relume_io/relume-ui";
import useUserRoles from "@/hooks/useUserRoles";

type Props = {
  filterType?: "company" | "job" | "contact";
  filterId?: string;
  setSelectedJob?: any;
  selectedJob?: any;
  isSelectJob?: boolean;
};

const ListJobView = ({
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
      const response = await getCRMJobs(+page, filterType, filterId, undefined, undefined, searchValue, true);
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

  const selectActionColum = {
    _actionsColumn: (item: any) => [
      <Button
        className="!py-[14px]"
        key={`select-company-${item.id}`}
        variant={item.id == selectedJob?.id ? "tab-selected" : "tab-unselect"}
        onClick={() => {
          setSelectedJob(item);
        }}
      >
        <Text className="w-18">
          {item.id == selectedJob?.id ? "Selected" : "Select"}
        </Text>
      </Button>,
    ],
    get actionsColumn() {
      return this._actionsColumn;
    },
    set actionsColumn(value) {
      this._actionsColumn = value;
    }
  }

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
    pageUrl: "/crm/jobs",
    columns: {
      deal_name: { path: "job_name", header: "Title", type: "string" },
      stage: { path: "stage", header: "Stage", type: "string" },
      appointment_date: {
        path: "consultation_date",
        header: "Appointment Date",
        type: "date",
      },
      status: { path: "status", header: "status", type: "string" },
      Owner: { path: "added_by_name", header: "Owner", type: "string" },
      customer_email: { path: "linked_contact_email", header: "Customer Email", type: "string" }
    },
    alerts: [],
    hideAddButton: true,
    hasNavigation: !isSelectJob,
    ...(isSelectJob ? selectActionColum : {})
  };

  const jobsOutOfServiceTableConfig = {
    tableName: "Unserviceable Jobs – Out Of Service Area",
    outOfServiceJobsPage,
    search: searchOutOfService,
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
    hasNavigation: !isSelectJob,
    ...(isSelectJob ? selectActionColum : {})
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

export default memo(ListJobView);
