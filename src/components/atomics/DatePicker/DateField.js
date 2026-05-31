import { useEffect, useRef } from "react";
import { useDateFieldState } from "react-stately";
import { useDateField, useDateSegment } from "react-aria";
import { createCalendar, parseDate } from "@internationalized/date";
import moment from "moment";

export function DateField(props) {
  let locale = 'en-US'
  let state = useDateFieldState({
    ...props,
    locale,
    createCalendar
  });

  let ref = useRef();
  let { fieldProps } = useDateField(props, state, ref);

  useEffect(() => {
    const year = state.segments.find(item => item.type === "year").value;
    const month = String(state.segments.find(item => item.type === "month").value).padStart(2, '0');
    const day = String(state.segments.find(item => item.type === "day").value).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    if (moment(formattedDate, "YYYY-MM-DD", true).isValid() && !props.calenderOpen) {
      props.handleDateChange({ year, month, day })
    }
  }, [state.value]);

  return (
    <div {...fieldProps} ref={ref} className="flex" aria-label="Date field">
      {state.segments.map((segment, i) => (
        <DateSegment key={i} segment={segment} state={state} />
      ))}
    </div>
  );
}

function DateSegment({ segment, state }) {
  let ref = useRef();
  let { segmentProps } = useDateSegment(segment, state, ref);

  return (
    <div
      {...segmentProps}
      ref={ref}
      style={{
        ...segmentProps.style,
        minWidth: segment.maxValue != null ? String(segment.maxValue).length + "ch" : undefined
      }}
      className={`px-0.5 box-content tabular-nums text-right outline-none rounded-sm focus:bg-primary-main focus:text-white group ${!segment.isEditable ? "text-neutral-50" : "text-neutral-80"
        }`}
    >
      {/* Always reserve space for the placeholder, to prevent layout shift when editing. */}
      <span
        aria-hidden="true"
        className="block w-full text-center italic text-gray-500 group-focus:text-white "
        style={{
          visibility: segment.isPlaceholder ? "" : "hidden",
          height: segment.isPlaceholder ? "" : 0,
          pointerEvents: "none"
        }}
      >
        {segment.placeholder}
      </span>
      {segment.isPlaceholder ? "" : segment.text}
    </div>
  );
}
