import { useRef } from "react";
import {
  useCalendarCell,
  useLocale,
  useFocusRing,
  mergeProps
} from "react-aria";
import { isSameDay, getDayOfWeek, today } from "@internationalized/date";

export function CalendarCell({ state, onClick, date }) {
  let ref = useRef();
  let {
    cellProps,
    buttonProps,
    isSelected,
    isOutsideVisibleRange,
    isDisabled,
    formattedDate,
    isInvalid
  } = useCalendarCell({ date }, state, ref);

  // The start and end date of the selected range will have
  // an emphasized appearance.
  let isSelectionStart = state.highlightedRange
    ? isSameDay(date, state.highlightedRange.start)
    : isSelected;
  let isSelectionEnd = state.highlightedRange
    ? isSameDay(date, state.highlightedRange.end)
    : isSelected;

  // We add rounded corners on the left for the first day of the month,
  // the first day of each week, and the start date of the selection.
  // We add rounded corners on the right for the last day of the month,
  // the last day of each week, and the end date of the selection.
  let { locale } = useLocale();
  let dayOfWeek = getDayOfWeek(date, locale);
  let isRoundedLeft =
    isSelected && (isSelectionStart || dayOfWeek === 0 || date.day === 1);
  let isRoundedRight =
    isSelected &&
    (isSelectionEnd ||
      dayOfWeek === 6 ||
      date.day === date.calendar.getDaysInMonth(date));

  let { focusProps, isFocusVisible } = useFocusRing();

  const isToday = isSameDay(date, today(date.timeZone));

  return (
    <td
      {...cellProps}
      className={`py-0.5 relative ${isFocusVisible ? "z-10" : "z-0"}`}
    >
      <div
        {...mergeProps(buttonProps, focusProps)}
        ref={ref}
        onClick={onClick}
        hidden={isOutsideVisibleRange}
        className={`w-9 h-9 outline-none group text-sm ${isRoundedLeft ? "rounded-l-full" : ""
          } ${isRoundedRight ? "rounded-r-full" : ""} ${isSelected ? (isInvalid ? "bg-red-300" : "bg-primary-highlight") : ""
          } ${isDisabled ? "disabled" : ""}`}
      >
        <div
          className={`w-full h-full rounded-full flex items-center justify-center ${isDisabled && !isInvalid ? "text-gray-400" : ""
            } ${
            // Focus ring, visible while the cell has keyboard focus.
            isFocusVisible
              ? "ring-2 group-focus:z-2 ring-primary-main0 ring-offset-2"
              : ""
            } ${
            // Darker selection background for the start and end.
            isSelectionStart || isSelectionEnd
              ? isInvalid
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-primary-main text-white hover:bg-primary-main"
              : ""
            } ${
            // Hover state for cells in the middle of the range.
            isSelected && !isDisabled && !(isSelectionStart || isSelectionEnd)
              ? isInvalid
                ? "hover:bg-red-400"
                : "hover:bg-primary-highlight"
              : ""
            } ${
            // Hover state for non-selected cells.
            !isSelected && !isDisabled ? "hover:bg-primary-highlight" : ""
            } cursor-default`}
        >
          {formattedDate}
          {isToday && <div className="absolute bottom-0.5 w-[6px] h-[6px] rounded-full bg-primary-main"></div>}
        </div>
      </div>
    </td>
  );
}
