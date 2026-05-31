import { twMerge } from "tailwind-merge";
import { ChevronRightIcon } from "@heroicons/react/outline";

export const arrow = (className?: string) => {
  return (
    <div
      className={twMerge("cursor-pointer w-5 h-5 min-h-4 min-w-5", className)}
    >
      <ChevronRightIcon />
    </div>
  );
};
