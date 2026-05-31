import { useEffect, useRef, useState } from "react";
import { useCalendarState } from "react-stately";
import { useCalendar, useLocale } from "react-aria";
import moment from "moment";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/outline";
import { createCalendar, parseDate } from "@internationalized/date";
import { CalendarButton } from "./Button";
import { CalendarGrid } from "./CalendarGrid";
import Button from "../Button";
export function Calendar(props) {
  const { locale } = useLocale();
  const state = useCalendarState({
    ...props,
    locale,
    createCalendar,
  });

  const formatStateValue = () => {
    if (state.value) {
      const { year, month, day } = state.value;
      return moment(`${year}-${month}-${day}`, "YYYY-M-D").format(
        "MMM D, YYYY"
      );
    }
    return moment(new Date()).format("MMM D, YYYY");
  };

  const [error, setError] = useState("");
  const [inputValue, setInputValue] = useState(formatStateValue());

  const ref = useRef();
  const { calendarProps, prevButtonProps, nextButtonProps, title } =
    useCalendar(props, state, ref);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
  };

  useEffect(() => {
    setInputValue(formatStateValue());
  }, [state.value])

  const handleApply = (e) => {
    e.preventDefault();
    if (!moment(inputValue, "MMM D, YYYY", true).isValid()) {
      setError("Please enter a valid date in the format MMM D, YYYY.");
    } else {
      setError("");
      const parsedDate = moment(inputValue, "MMM D, YYYY");
      const dateObject = {
        year: parsedDate.year(),
        month: parsedDate.month() + 1,
        day: parsedDate.date(),
      };
      props?.handleDateChange(dateObject);
      props.handleCloseCalendar();
    }
  };

  const handleSetNewDate = (date) => {
    const { year, month, day } = date;
    const formattedDate = moment(`${year}-${month}-${day}`, "YYYY-M-D").format(
      "MMM D, YYYY"
    );
    setInputValue(formattedDate);
  };

  const handleCancel = () => {
    props.handleCloseCalendar();
  };

  const handleTodayClick = () => {
    const today = moment(new Date()).format("MMM D, YYYY");
    setInputValue(today);
    setError("");

    const parsedToday = moment(new Date()).format("YYYY-MM-DD");
    const [year, month, day] = parsedToday.split("-");
    const newDateObject = parseDate(
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
        2,
        "0"
      )}`
    );

    state.setValue(newDateObject);
  };

  return (
    <div
      {...calendarProps}
      ref={ref}
      className="inline-block text-gray-800 w-full"
    >
      <div className="flex items-center pb-4 px-4 pt-4">
        <CalendarButton {...prevButtonProps}>
          <ChevronLeftIcon className="h-4 w-4" />
        </CalendarButton>
        <h3 className="flex-1 font-bold text-[18px] text-center">{title}</h3>
        <CalendarButton {...nextButtonProps}>
          <ChevronRightIcon className="h-4 w-4" />
        </CalendarButton>
      </div>
      <div className="pb-4 px-2 sm:px-4">
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            className="flex-1 font-medium text-sm border border-neutral-40 rounded-lg px-2 !h-9 w-[calc(100%-80px)]"
            placeholder="MMM D, YYYY"
          />
          <Button
            variant="outline"
            className="px-4 !py-0 rounded-lg ml-3 !h-9 !font-medium"
            onClick={handleTodayClick}
          >
            Today
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
      <CalendarGrid handleSetNewDate={handleSetNewDate} state={state} />
      <div className="flex justify-center gap-3 border-t border-neutral-40 p-2 sm:p-4">
        <Button
          variant="outline"
          className="text-sm font-semibold px-4 rounded-lg w-full !h-10 !py-0"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          variant="primary-bg"
          className="border border-neutral-40 px-4 rounded-lg w-full !h-10 !py-0"
          onClick={handleApply}
        >
          Apply
        </Button>
      </div>
    </div>
  );
}