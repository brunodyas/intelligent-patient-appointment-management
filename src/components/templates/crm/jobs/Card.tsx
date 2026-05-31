import { FC, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";
import { DateTime } from "luxon";
import { formatDateForFranchiseUser } from "@/utils/formatDate";
export type CardType = {
  id: string;
  title: string;
  created_at?: string;
  total?: string;
};

const Card: FC<CardType> = ({ id, title, created_at, total }) => {
  const router = useRouter()
  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: id,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [initialPosition, setInitialPosition] = useState<{ x: number; y: number } | null>(null);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setInitialPosition({ x: event.clientX, y: event.clientY });
    setIsDragging(false);
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
    if (initialPosition) {
      const distance = Math.sqrt(
        Math.pow(event.clientX - initialPosition.x, 2) +
        Math.pow(event.clientY - initialPosition.y, 2)
      );
      if (distance < 5) {
        router.push(`${routes.crmJobs}/${id}`);
      }
    }
    setInitialPosition(null);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const style = {
    margin: "10px",
    opacity: 1,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div 
      ref={setNodeRef} 
      {...attributes} 
      {...listeners} 
      style={style} 
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onDragStart={handleDragStart}>
      <div
        id={id}
        className="p-4 rounded-xl border border-neutral-lightest bg-brand-white hover:shadow-xlarge text-sm"
      >
        <p className="font-bold">{title}</p>
        <p className="font-normal text-gray-700">{created_at ? formatDateForFranchiseUser(created_at) || DateTime.fromISO(created_at).toLocaleString(
          DateTime.DATETIME_MED_WITH_WEEKDAY
        ) : ""}</p>
        {total && (
          <div className=" mt-2 rounded-xl px-2 py-1 bg-background-secondary text-xs text-text-secondary w-fit ">
            {total}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
