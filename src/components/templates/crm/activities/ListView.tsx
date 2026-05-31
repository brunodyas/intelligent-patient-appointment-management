"use client";
import { Alerts, Button } from "@/components/atomics";
import UI8Table from "@/components/UI8Table";
import { activitiesTypes, size } from "@/constants/constants";
import { useJune } from "@/hooks/useJune";
import { CRMActivitiesResponse } from "@/interface/activities";
import {
  deleteActivityById,
  getCRMActivities,
  updatedStatusActivityById,
} from "@/services/activities";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  filterType?: "company" | "job" | "contact";
  filterId?: string;
  isRefetch?: boolean;
  setIsRefetch?: (value: boolean) => void;
};

const ListActivityView = ({
  filterType,
  filterId,
  isRefetch,
  setIsRefetch,
}: Props) => {
  const defaultFilter = {
    completed: false,
    isSort: false
  };
  
  const [search, setSearch] = useState("")
  const timeoutRef = useRef<any>(null);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [openAlertsDelete, setOpenAlertsDelete] = useState(false);
  const [activityTableData, setactivityTableData] =
    useState<CRMActivitiesResponse>();
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);
  const [openAlertsUpdated, setOpenAlertsUpdated] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState(defaultFilter);
  const [totalPages, setTotalPages] = useState(1);
  const analytics = useJune();

  const fetchActivitiesData = useCallback(async (searchValue: string) => {
    try {
      const response = await getCRMActivities(
        +page,
        filterType,
        filterId,
        filter,
        searchValue
      );
      analytics?.track("getCRMActivities");
      setactivityTableData(response);
      setTotalPages(Math.ceil(response?.count / size));
    } catch (e) {
      console.error("Error fetching call list:", e);
    }
  }, [page, filter]);


  const handleSearchChange = useCallback((searchValue: string) => {
    if (timeoutRef) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {
      fetchActivitiesData(searchValue)
    }, 2000);
    setSearch(searchValue)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search])

  useEffect(() => {
    fetchActivitiesData(search);
  }, [page, filter]);

  useEffect(() => {
    if (isRefetch) {
      fetchActivitiesData(search);
      setIsRefetch && setIsRefetch(!isRefetch);
    }
  }, [isRefetch]);

  const deleteActivity = async (activityToDelete: number) => {
    try {
      await deleteActivityById(activityToDelete);
      analytics?.track("deleteActivityById");
      setOpenModalDelete(false);
      setOpenAlertsDelete(true);
      fetchActivitiesData(search);
    } catch (error) {
      console.log("Delete Activity Error", error);
      throw error;
    }
  };

  const UpdatedActivity = async (item: any) => {
    try {
      await updatedStatusActivityById({
        ...item,
        completed: !item?.completed,
      });
      analytics?.track("updatedStatusActivityById");
      setOpenAlertsUpdated(true);
      fetchActivitiesData(search);
    } catch (error) {
      console.log("Updated Activity Error", error);
      throw error;
    }
  };

  const tableConfig = {
    tableName: "List View",
    pageUrl: "/crm/activities",
    page,
    totalPages,
    search,
    handleSearchChange,
    handlePageChange: (page: number) => {
      setPage(page);
    },
    columns: {
      name: { path: "activity_name", header: "Activity Name", type: "string" },
      email: { path: "added_by.email", header: "Email", type: "string" },
      activity_date: {
        path: "due_date",
        header: "Activity Date",
        type: "OnlyDate",
      },
      start_time: { path: "start_time", header: "Activity Time", type: "time" },
      activity_type: {
        path: "activity_type",
        header: "Activity Type",
        type: "string",
      },
      addedBy: { path: "added_by.name", header: "Added By", type: "string" },
    },
    updatedColumn: (item: any) => [
      <Button
        key={`select-comp-${item.id}`}
        size="md"
        variant={item?.completed ? "tab-selected" : "tab-unselect"}
        className="mr-4 min-w-32 !h-11"
        onClick={(e: any) => {
          e.stopPropagation();
          UpdatedActivity(item);
        }}
      >
        {item?.completed ? "Completed" : "Not Completed"}
      </Button>,
    ],
    actionsColumn: (item: any) => [
      <Button
        className="!w-11 !h-11"
        key={`add-comp-${item.id}`}
        size="md"
        variant="default-bg"
        onClick={(e: any) => {
          e.stopPropagation();
          setActivityToDelete(item.id);
          setOpenModalDelete(true);
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
            d="M13.5 3.5L2.5 3.50001"
            stroke="#FF5630"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.5 6.5V10.5"
            stroke="#FF5630"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 6.5V10.5"
            stroke="#FF5630"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.5 3.5V13C12.5 13.1326 12.4473 13.2598 12.3536 13.3536C12.2598 13.4473 12.1326 13.5 12 13.5H4C3.86739 13.5 3.74021 13.4473 3.64645 13.3536C3.55268 13.2598 3.5 13.1326 3.5 13V3.5"
            stroke="#FF5630"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.5 3.5V2.5C10.5 2.23478 10.3946 1.98043 10.2071 1.79289C10.0196 1.60536 9.76522 1.5 9.5 1.5H6.5C6.23478 1.5 5.98043 1.60536 5.79289 1.79289C5.60536 1.98043 5.5 2.23478 5.5 2.5V3.5"
            stroke="#FF5630"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>,
    ],
    hideAddButton: true,
    hasNavigation: true,
    modals: [
      {
        title: "Delete Activity",
        className: "max-w-lg",
        open: openModalDelete,
        setOpen: setOpenModalDelete,
        modalChild: (
          <>
            <main className="mb-10 mt-4">
              <p className="text-sm text-neutral-80">
                Are you sure want to delete this Activity? Activies that have
                been deleted can not be recovered
              </p>
            </main>
            <footer className="flex w-full justify-end gap-3">
              <Button
                className="!h-10"
                size="md"
                variant="default-nude"
                onClick={() => setOpenModalDelete(false)}
              >
                Cancel
              </Button>
              <Button
                className="!h-10"
                size="md"
                variant="error-bg"
                onClick={() => {
                  if (activityToDelete) {
                    deleteActivity(activityToDelete);
                  }
                }}
              >
                Submit
              </Button>
            </footer>
          </>
        ),
      },
    ],
    alerts: [
      <Alerts
        key="alert-activity-deleted"
        variant="success"
        open={openAlertsDelete}
        setOpen={setOpenAlertsDelete}
        title="Activity has been deleted"
        desc="Activity has been deleted. Please review any adjustments to your records as necessary."
      />,
      <Alerts
        key="alert-activity-Updated"
        variant="success"
        open={openAlertsUpdated}
        setOpen={setOpenAlertsUpdated}
        title="Activity has been Updated"
        desc="Activity has been Updated. Please review any adjustments to your records as necessary."
      />,
    ],
    types: activitiesTypes,
    setFilter,
    filter,
  };

  return (
    activityTableData && (
      <UI8Table data={activityTableData.results as any} config={tableConfig} />
    )
  );
};

export default ListActivityView;
