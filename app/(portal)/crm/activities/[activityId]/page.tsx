"use client";

import { Alerts, Button } from "@/components/atomics";
import Route from "@/components/atomics/Route";
import { routes } from "@/constants/routes";
import { useJune } from "@/hooks/useJune";
import { CRMActivityByIdResponse } from "@/interface/activities";
import {
  getActivityById,
  updatedStatusActivityById,
} from "@/services/activities";
import {
  dueDate,
  formatDateForFranchiseUser,
  formatTime,
} from "@/utils/formatDate";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const ActivityDetails = () => {
  const params = useParams<{ activityId: string }>();
  const activityId = params?.activityId || '';

  const [activity, setActivity] = useState<CRMActivityByIdResponse>();
  const [openAlertsUpdated, setOpenAlertsUpdated] = useState(false);
  const analytics = useJune();
  const fetchData = async () => {
    try {
      const response = await getActivityById(activityId);
      analytics?.track("getActivityById");
      setActivity(response);
    } catch (e) {
      throw e;
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
      fetchData();
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchData();
  }, [activityId]);

  const detailFields: {
    fieldName: string;
    fieldValue?: string | number | null;
  }[] = [
    {
      fieldName: "Activity",
      fieldValue: activity?.activity_name,
    },
    {
      fieldName: "Type",
      fieldValue: activity?.activity_type,
    },
    {
      fieldName: "Added By",
      fieldValue: activity?.added_by.name,
    },
    {
      fieldName: "Created At",
      fieldValue: formatDateForFranchiseUser(activity?.createdAt as any),
    },
    {
      fieldName: "Updated At",
      fieldValue: formatDateForFranchiseUser(activity?.updatedAt as any),
    },
    {
      fieldName: "Due Date",
      fieldValue: dueDate(
        activity?.due_date || "",
        activity?.added_by?.franchise_timezone || ""
      ),
    },
    {
      fieldName: "Duration",
      fieldValue: activity?.duration,
    },
    {
      fieldName: "Linked Company",
      fieldValue: activity?.linked_company,
    },
    {
      fieldName: "Linked Customers",
      fieldValue: activity?.linked_contacts,
    },
    {
      fieldName: "Linked Franchise",
      fieldValue: activity?.linked_franchise,
    },
    {
      fieldName: "Completed",
      fieldValue: activity?.completed ? "Yes" : "No",
    },
    {
      fieldName: "Completed Date",
      fieldValue: activity?.completed_date
        ? formatDateForFranchiseUser(activity?.completed_date as any)
        : null,
    },
    {
      fieldName: "Meeting Location",
      fieldValue: activity?.meeting_location,
    },
    {
      fieldName: "Meeting Type",
      fieldValue: activity?.meeting_type,
    },
    {
      fieldName: "Meeting Link",
      fieldValue: activity?.meeting_link,
    },
    {
      fieldName: "Start Time",
      fieldValue:
        activity?.start_time &&
        activity?.added_by?.franchise_timezone &&
        formatTime(
          activity?.start_time || "",
          activity?.added_by?.franchise_timezone || ""
        ),
    },
  ];

  /**
   *Modal to add a activity and link
   *Calendar view as main page
   *Option to calendar as list view
   **/

  return (
    <div className="w-full">
      <div className="flex w-full flex-row gap-4">
        <Button size="md" variant="primary-bg" className="ml-auto">
          <Route route={routes.crmActivities} linkClassName="">
            Back
          </Route>
        </Button>
        <Button
          key={`select-comp-${activity?.id}`}
          size="md"
          variant={activity?.completed ? "tab-selected" : "tab-unselect"}
          className="mr-4 min-w-32"
          onClick={(e: any) => {
            e.stopPropagation();
            UpdatedActivity(activity);
          }}
        >
          {activity?.completed ? "Completed" : "Not Completed"}
        </Button>
      </div>
      <div className="border rounded-md w-11/12 max-md:w-11/12 m-auto shadow-small mt-5">
        <p className="mt-5 mx-5 font-semibold text-lg sm:text-xl">Details</p>
        <div className="grid gap-4 grid-cols-2 py-5 px-8 max-smx:grid-cols-1 max-smx:px-4">
          {activity &&
            detailFields.map(
              ({ fieldName, fieldValue }) =>
                fieldValue && (
                  <div className="py-4 flex" key={fieldName}>
                    <p className="text-[#333333b3] mr-5 flex-shrink-0 text-sm">
                      {fieldName}:
                    </p>
                    <p className="w-3/4 break-words text-sm">{fieldValue}</p>
                  </div>
                )
            )}
        </div>
        {activity?.job && (
          <>
            <div className="gap-4 py-5 px-8 flex">
              <p className="text-[#333333b3] mr-5 flex-shrink-0 text-sm">
                Job Name:
              </p>
              <p className="w-3/4 break-words text-sm">
                {activity?.job?.job_name}
              </p>
            </div>
            <div className="gap-4 py-5 px-8 flex">
              <p className="text-[#333333b3] mr-5 flex-shrink-0 text-sm">
                Job description:
              </p>
              <p className="w-3/4 break-words text-sm">
                {activity?.job?.customer_description}
              </p>
            </div>
          </>
        )}
      </div>
      <Alerts
        key="alert-activity-Updated"
        variant="success"
        open={openAlertsUpdated}
        setOpen={setOpenAlertsUpdated}
        title="Activity has been Updated"
        desc="Activity has been Updated. Please review any adjustments to your records as necessary."
      />
    </div>
  );
};

export default ActivityDetails;
