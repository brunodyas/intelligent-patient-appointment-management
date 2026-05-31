import { FC } from "react";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import Card, { CardType } from "./Card";
import { Pagination } from "@/components/atomics";

export type ColumnType = {
  count: any;
  id: string;
  title: string;
  totalPages: number;
  pipeline: "REPAIRS" | "CONSULTATION";
  currentPage: number;
  cards: CardType[];
  handlePageChange: (page: number) => void;
};

const Column: FC<ColumnType> = ({
  count,
  id,
  title,
  cards,
  pipeline,
  currentPage,
  totalPages,
  handlePageChange,
}) => {
  const { setNodeRef } = useDroppable({ id: id });
  return (
    <SortableContext id={id} items={cards} strategy={rectSortingStrategy}>
      <div
        ref={setNodeRef}
        className="w-[300px] min-w-[300px] max-w-[300px]   rounded-xl min-h-[55vh] "
      >
        <p className="w-[300px] text-sm font-bold pt-5 px-5 bg-[rgba(245,247,249,1.00)] rounded-t-lg">
          {title?.replace("_", " ")}
        </p>
        <div className="overflow-y-auto overflow-x-hidden min-h-[50vh] max-h-[50vh] bg-[rgba(245,247,249,1.00)]">
          {cards.map((card) => (
            <Card
              key={card?.id}
              id={card?.id}
              title={card?.title}
              created_at={card?.created_at}
              total={card?.total}
            />
          ))}
        </div>
        <div className="bg-white">
          {count ? (
            <Pagination
              className="flex-col gap-2 pb-3"
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          ) : (
            <div className="py-3"></div>
          )}
        </div>
      </div>
    </SortableContext>
  );
};

export default Column;
