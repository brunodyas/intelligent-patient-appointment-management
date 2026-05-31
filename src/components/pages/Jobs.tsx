"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Title } from "../atomics";
import ListJobView from "../templates/crm/jobs/ListView";
import JobsTable from "../templates/crm/jobs/Table";
import AddJobModal from "../templates/crm/jobs/AddJobModal";

const JobsPage = () => {
  const router = useRouter();
  const [isBoardView, setIsBoardView] = useState(true);
  const [openAddJob, setOpenAddJob] = useState(false);
  const headerButton = [
    {
      content: `Switch to ${isBoardView ? "List View" : "Board View"}`,
      action: () => setIsBoardView(!isBoardView),
    },
    {
      content: " Create a New Job",
      action: () => setOpenAddJob(true),
    },
  ];
  return (
    <div className="p-10 max-smx:py-10 max-smx:px-3">
      <AddJobModal
        setOpenAddJob={setOpenAddJob}
        openAddJob={openAddJob}
        jobToEdit={""}
        setIsSubmit={(val) => { }}
      />
      <div className="flex  justify-between gap-10 items-center flex-wrap">
        <Title size="sm" variant="primary">
          Jobs
        </Title>
        <div className="flex gap-3 flex-wrap">
          {headerButton.map((item, k) => (
            <Button
              key={k}
              size="md"
              variant="tab-selected"
              onClick={item.action}
              className="!rounded-md !border-none"
            >
              {item.content}
            </Button>
          ))}
        </div>
      </div>
      {isBoardView ? <JobsTable /> : <ListJobView />}
    </div>
  );
};

export default JobsPage;
