import {
  CONSOLATION_OPTIONS,
  PIPELINE_OPTIONS,
  REPAIR_OPTIONS,
} from "@/components/templates/crm/jobs/AddJobModal/JobInformationFormData";
import { ColumnType } from "@/components/templates/crm/jobs/Colunm";
import { getCRMJobs, updateJobById } from "@/services/jobs";
import { DragEndEvent, DragOverEvent,DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { useJune } from "../useJune";

const DEFAULT_REPAIRS_DATA: ColumnType[] = [
  {
    id: "new",
    title: "NEW",
    currentPage: 0,
    pipeline: "REPAIRS",
    totalPages: 0,
    cards: [],
    handlePageChange: function (page: number): void {},
    count: 0,
  },
  {
    id: "diagnose",
    title: "DIAGNOSE",
    pipeline: "REPAIRS",
    currentPage: 0,
    totalPages: 0,
    cards: [],
    handlePageChange: function (page: number): void {},
    count: 0,
  },
  {
    id: "in_progress",
    pipeline: "REPAIRS",
    currentPage: 0,
    totalPages: 0,
    title: "IN PROGRESS",
    cards: [],
    handlePageChange: function (page: number): void {},
    count: 0,
  },
  {
    id: "complete",
    pipeline: "REPAIRS",
    currentPage: 0,
    totalPages: 0,
    title: "COMPLETED",
    cards: [],
    handlePageChange: function (page: number): void {},
    count: 0,
  },
];

const DEFAULT_CONSULTATION_DATA: ColumnType[] = [
  {
    id: "new",
    title: "NEW",
    currentPage: 0,
    pipeline: "CONSULTATION",
    totalPages: 0,
    cards: [],
    handlePageChange: function (page: number): void {},
    count: 0,
  },
  {
    id: "consultation",
    pipeline: "CONSULTATION",
    title: "CONSULTATION",
    currentPage: 0,
    totalPages: 0,
    cards: [],
    handlePageChange: function (page: number): void {},
    count: 0,
  },
  {
    id: "ordered",
    currentPage: 0,
    pipeline: "CONSULTATION",
    totalPages: 0,
    title: "ORDERED",
    cards: [],
    handlePageChange: function (page: number): void {},
    count: 0,
  },
  {
    id: "installation",
    currentPage: 0,
    pipeline: "CONSULTATION",
    totalPages: 0,
    title: "INSTALLATION",
    cards: [],
    handlePageChange: function (page: number): void {},
    count: 0,
  },
];

export const  fetchCRMJobsForStages = async (
  pipeline: any,
  stages: any,
  page: any,
  fetchGetCRMJobs: any
) => {
  //  const analytics = useJune();
  return Promise.all(
    stages.map(async (stage: any) => {
      const data = await getCRMJobs(
        page,
        undefined,
        undefined,
        pipeline.value,
        stage.value
      );
      fetchGetCRMJobs();
      return {
        id: stage.value.toLowerCase(),
        title: stage.value,
        currentPage: data.results.length ? page : 0,
        pipeline: pipeline.value,
        count: data.count,
        totalPages: Math.ceil(data.count / 10),
        cards: data.results,
      };
    })
  );
};

export const useJobTable = () => {
  const [isRepairs, setIsRepairs] = useState<boolean>(false);
  const [consultationColumn, setConsultationColumn] = useState<ColumnType[]>(
    DEFAULT_CONSULTATION_DATA
  );
  console.log("🚀 ~ useJobTable ~ consultationColumn:", consultationColumn)
  const [overColumnId, setOverColumnId] = useState("");
  const [activeColmnId, setActiveColumnId] = useState("");
  const [repairsColumn, setRepairsColumn] =
    useState<ColumnType[]>(DEFAULT_REPAIRS_DATA);
    const [dragStart,setDragStart] = useState<ColumnType | null>(null);
    const [dragEnd,setDragEnd] = useState<ColumnType | null>(null);
  const analytics = useJune();
  const onChangeIsRepairs = (value: boolean) => {
    if (value !== isRepairs) {
      setIsRepairs(value);
      if (value) {
        setColumns(repairsColumn);
        setConsultationColumn(columns);
        setRepairsColumn([]);
      } else {
        setColumns(consultationColumn);
        setRepairsColumn(columns);
        setConsultationColumn([]);
      }
    }
  };

  const [columns, setColumns] = useState<ColumnType[]>(DEFAULT_REPAIRS_DATA);
  const fetchGetCRMJobs = () => {
    analytics?.track("getCRMJobs");
  };
  const fetchAllCRMJobs = async () => {
    await Promise.all(
      PIPELINE_OPTIONS.map(async (pipeline) => {
        if (pipeline.value === "CONSULTATION") {
          const s = await fetchCRMJobsForStages(
            pipeline,
            CONSOLATION_OPTIONS,
            1,
            fetchGetCRMJobs
          );
          setConsultationColumn(s);
          setColumns(s);
          return s;
        } else {
          const s = await fetchCRMJobsForStages(
            pipeline,
            REPAIR_OPTIONS,
            1,
            fetchGetCRMJobs
          );
          setRepairsColumn(s);
          return s;
        }
      })

        
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchAllCRMJobs();
    };
    fetchData();
  }, []);

  const findColumn = (unique: string | null) => {
    if (!unique) {
      return null;
    }
    if (columns.some((c) => c.id === unique)) {
      return columns.find((c) => c.id === unique) ?? null;
    }
    const id = String(unique);
    const itemWithColumnId = columns.flatMap((c) => {
      const columnId = c.id;
      return c.cards.map((i) => {
        return i?.id ? { itemId: i.id, columnId: columnId } : {};
      });
    });
    const columnId = itemWithColumnId.find((i) => i.itemId === id)?.columnId;
    return columns.find((c) => c.id === columnId) ?? null;
  };

  const handleDragStart = (event:DragStartEvent) => {
    const { active, } = event;
    const activeId = String(active.id);
    const activeColumn = findColumn(activeId);
    setDragStart(activeColumn)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over, delta } = event;
    const activeId = String(active.id);
    const overId = over ? String(over.id) : null;
    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);

    if (!activeColumn || !overColumn || activeColumn === overColumn) {
      return null;
    }
    setOverColumnId(overColumn?.id ?? "");
    setActiveColumnId(activeColumn?.id ?? "");
    setColumns((prevState) => {
      const activeItems = activeColumn.cards;
      const overItems = overColumn.cards;
      const activeIndex = activeItems.findIndex(
        (i) => i?.id && i.id === activeId
      );
      const overIndex = overItems.findIndex((i) => i?.id && i.id === overId);
      const newIndex = () => {
        const putOnBelowLastItem =
          overIndex === overItems.length - 1 && delta.y > 0;
        const modifier = putOnBelowLastItem ? 1 : 0;
        return overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      };
      return prevState.map((c) => {
        if (c.id === activeColumn.id) {
          c.cards = activeItems
            .filter((i) => i?.id && i.id !== activeId)
            .filter((item) => !!item);
          return c;
        } else if (c.id === overColumn.id) {
          c.cards = [
            ...overItems.slice(0, newIndex()),
            activeItems[activeIndex],
            ...overItems.slice(newIndex(), overItems.length),
          ].filter((item) => !!item);
          return c;
        } else {
          return c;
        }
      });
    });
  };

  const updateJob = async (jobId: string, new_stage: string) => {
    const current_pipeline = isRepairs ? "REPAIRS" : "CONSULTATION";
    try {
      await updateJobById(jobId, {
        pipeline: current_pipeline.toUpperCase(),
        stage: new_stage.toUpperCase(),
      });
      analytics?.track("updateJobById");
    } catch (e) {
      throw e;
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = String(active.id);
    const overId = over ? String(over.id) : null;
    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);
    setDragEnd(activeColumn)

    await updateJob(activeId, activeColumn?.title as any);

    if (!activeColumn || !overColumn || activeColumn !== overColumn) {
      return null;
    }
    const activeIndex = activeColumn.cards.findIndex(
      (i) => i?.id && i.id === activeId
    );
    const overIndex = overColumn.cards.findIndex(
      (i) => i?.id && i.id === overId
    );
    if (activeIndex !== overIndex) {
      setColumns((prevState) => {
        return prevState.map((column) => {
          if (column.id === activeColumn.id) {
            column.cards = arrayMove(overColumn.cards, activeIndex, overIndex);
            return column;
          } else {
            return column;
          }
        });
      });
    }

    const updateColumnsCount = [...columns];
    if (overColumnId != activeColmnId) {
      updateColumnsCount.forEach((column) => {
        if (column.id === activeColmnId) {
          column.count = column.count - 1;
          column.totalPages = Math.ceil(column.count / 10);
        } else if (column.id === overColumnId) {
          column.currentPage = column.currentPage ? column.currentPage : 1;
          column.count = column.count + 1;
          column.totalPages = Math.ceil(column.count / 10);
        }
      });
      setColumns(updateColumnsCount);
    }
    handleDragUpdate(dragStart,dragEnd);
  };

  const handleDragUpdate = async (dragStart: ColumnType |null, dragEnd: ColumnType | null) => {
    if (dragStart && dragEnd) {
      if (dragStart=== dragEnd) {
        return;
      } else {
        try {
          const pipeline = isRepairs ? "REPAIRS" : "CONSULTATION"; 
          const filteredColumns:any = columns.filter((column) =>
            column.pipeline === pipeline && column.title === dragStart.title
        );
        if(filteredColumns[0]?.count >= 10 && filteredColumns[0]?.cards?.length < 10) {
          const [jobsReponse]= await fetchCRMJobsForStages(
            { value: pipeline }, 
            [{ value: dragStart.title }], 
            filteredColumns[0].currentPage,
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
        }
          
  
        } catch (error) {
          console.error("Error fetching CRM jobs:", error);
        }
      }
    }
  };

  return {
    isRepairs,
    columns,
    setColumns,
    handleDragOver,
    handleDragEnd,
    onChangeIsRepairs,
    setRepairsColumn,
    setConsultationColumn,
    handleDragStart
  };
};
