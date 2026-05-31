import { useEffect, useRef } from "react";
import { useDatePickerState } from "react-stately";
import { useDatePicker } from "react-aria";
import { FieldButton } from "./Button";
import { ClearCalendar } from "./ClearCalendar";
import { DateField } from "./DateField";
import { Popover } from "./Popover";
import { Dialog } from "./Dialog";
import { CalendarIcon, ExclamationIcon } from "@heroicons/react/outline";
import { parseDate } from "@internationalized/date";

export function ClearDatePicker(props) {
  let newProps = props?.selected ? { ...props, defaultValue: parseDate(props?.selected), shouldCloseOnSelect: false } : { ...props, shouldCloseOnSelect: false };
  let state = useDatePickerState(newProps);
  let ref = useRef();
  let {
    groupProps,
    labelProps,
    fieldProps,
    buttonProps,
    dialogProps,
    calendarProps
  } = useDatePicker(newProps, state, ref);

  useEffect(() => {
    state.setValue(parseDate(props?.selected));
  }, [state.isOpen]);

  const handleClearCalendar = () => {
    props?.handleClearCalendar()
    state.close();
  };
  const handleCloseCalendar = () => {
    state.close();
  };
  
  return (
    <div className="relative flex-col text-left">
      <span {...labelProps} className="text-sm text-gray-800">
        {props.label}
      </span>
      <div {...groupProps} ref={ref} className="flex group">
        {props.isShowDate &&
          <div className="relative z-0 w-full rounded-l-lg border p-3 text-sm font-normal text-neutral-80 shadow-1 group-focus-within:border-primary-main group-focus-within:group-hover:border-primary-main-600 outline-none ring-[2.5px] ring-transparent transition-all duration-300 ease-out placeholder:text-neutral-50 2xl:p-3.5">
            <DateField calenderOpen={state.isOpen} handleDateChange={props.handleDateChange} {...fieldProps} />
            {state.validationState === "invalid" && (
              <ExclamationIcon className="w-6 h-6 text-red-500 absolute right-1" />
            )}
          </div>
        }
        <FieldButton
          {...buttonProps}
          isPressed={state.isOpen}
          className={`${!props.isShowDate
            ? "bg-primary-main text-white h-10 px-3 group-focus-within:text-primary-main !rounded-[10px] border-none"
            : ""
            }  `}
        >
          <CalendarIcon className="w-5 h-5" />
        </FieldButton>
      </div>
      {state.isOpen && (
        <Popover
          triggerRef={ref}
          state={state}
          placement={props.placement}
          className="!p-0 w-[310px] !max-h-[473px]"
        >
          <Dialog {...dialogProps}>
            <ClearCalendar
              handleClearCalendar={handleClearCalendar}
              handleCloseCalendar={handleCloseCalendar}
              handleDateChange={props?.handleDateChange}
              {...calendarProps} />
          </Dialog>
        </Popover>
      )}
    </div>
  );
}
