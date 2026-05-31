"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Calendar from "@/components/templates/crm/activities/CalendarPage"
import { Button, Title } from "@/components/atomics"
import { routes } from "@/constants/routes"
import ListActivityView from "@/components/templates/crm/activities/ListView"
import AddActivityModal from "@/components/templates/crm/activities/AddActivityModel"

type Props = {
  filterType?: "company" | "job" | "contact";
  filterId?: string;
}

const Activities = ({ filterType, filterId }: Props) => {
  const [isActivityView, setisActivityView] = useState<Boolean>(false);
  const router = useRouter();
  const [openAddActivity, setOpenAddActivity] = useState(false);
  const [isRefetch, setIsRefetch] = useState(false);
  const headerButton = [
    {
      content: "Back",
      action: () => router.push(routes.crmActivities),
    },
    {
      content: `${!isActivityView ? 'Switch to List View' : 'Switch to Calendar View'}`,
      action: () => setisActivityView(!isActivityView),
    },
    {
      content: "Create a New Activity",
      action: () => setOpenAddActivity(true),
    },
  ];

  return (
    <>
      <div className="p-10 max-smx:px-5 max-sm:p-0">
        <AddActivityModal setOpenAddActivity={setOpenAddActivity} setIsRefetch={setIsRefetch} openAddActivity={openAddActivity} />
        <div className="flex  justify-between gap-10 items-center flex-wrap">
          <Title size="sm" variant="primary">
          Calendar
          </Title>
          <div className="flex gap-3 flex-wrap">
            {headerButton.map((item, k) => (
              <Button
                key={k}
                size="md"
                variant="tab-selected"
                onClick={item.action}
                className="!border-none"
              >
                {item.content}
              </Button>
            ))}
          </div>
        </div>
        {isActivityView ? <ListActivityView filterId={filterId} setIsRefetch={setIsRefetch} isRefetch={isRefetch} filterType={filterType} /> : <Calendar setIsRefetch={setIsRefetch} isRefetch={isRefetch} filterId={filterId} filterType={filterType as any} />}
      </div>
    </>
  )
}
export default Activities;