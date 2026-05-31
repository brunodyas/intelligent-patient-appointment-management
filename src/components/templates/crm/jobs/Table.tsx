"use client";

import { FunnelIcon } from "@/assets/icons";
import { Button } from "@/components/atomics";
import Column from "@/components/templates/crm/jobs/Colunm";
import { fetchCRMJobsForStages, useJobTable } from "@/hooks/crm/useJobTable";
  import {
    closestCorners,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
  } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import React from "react";
import { useJune } from "@/hooks/useJune";

const JobsTable = () => {
  const {
    isRepairs,
    columns,
    handleDragOver,
    handleDragEnd,
    onChangeIsRepairs,
    setColumns,
    setRepairsColumn,
    setConsultationColumn,
    handleDragStart
  } = useJobTable();
  const analytics = useJune();

  const fetchGetCRMJobs = () => {
    analytics?.track("getCRMJobs");
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handlePageChange = async (page: number, pipeline: any, title: any) => {
    const [jobsReponse] = await fetchCRMJobsForStages(
      { value: pipeline },
      [{ value: title }],
      page,
      fetchGetCRMJobs
    );

    if (pipeline === "REPAIRS") {
      setRepairsColumn((prevColumns) => {
        return prevColumns.map((column) => {
          if (column.id === jobsReponse.id) {
            return {
              ...column,
              ...jobsReponse,
            };
          }
          return column;
        });
      });
    } else {
      setConsultationColumn((prevColumns) => {
        return prevColumns.map((column) => {
          if (column.id === jobsReponse.id) {
            return {
              ...column,
              ...jobsReponse,
            };
          }
          return column;
        });
      });
    }

    setColumns((prevColumns) => {
      return prevColumns.map((column) => {
        if (column.id === jobsReponse.id) {
          return {
            ...column,
            ...jobsReponse,
          };
        }
        return column;
      });
    });
  };

  return (
    <div className="mt-20">
      <div className="flex gap-10 justify-between flex-wrap">
        <div className="flex gap-3">
          <Button
            onClick={() => onChangeIsRepairs(true)}
            size="md"
            variant={isRepairs ? "tab-selected" : "tab-unselect"}
            className="!rounded-lg !h-11"
          >
            Repairs
          </Button>
          <Button
            onClick={() => onChangeIsRepairs(false)}
            size="md"
            variant={!isRepairs ? "tab-selected" : "tab-unselect"}
            className="!rounded-lg !h-11"
          >
            Consultation
          </Button>
        </div>
        <Button className="!h-11" size="md" variant="default-bg">
          Filter
          <FunnelIcon className="h-4 w-4 stroke-neutral-100 stroke-[4px]" />
        </Button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="flex gap-3 pt-10 overflow-x-auto">
          {columns?.map((column) => (
            <Column
              key={column.id}
              id={column.id}
              title={column.title}
              cards={column.cards}
              currentPage={column.currentPage}
              totalPages={column.totalPages}
              pipeline={column.pipeline}
              count={column.count}
              handlePageChange={(page) =>
                handlePageChange(page, column.pipeline, column.title)
              }
            ></Column>
          ))}
        </div>
      </DndContext>
    </div>
  );
};

export default JobsTable;
