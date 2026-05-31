import { useRef } from "react";
import { useButton, useFocusRing, mergeProps } from "react-aria";

export function CalendarButton(props) {
  let ref = useRef();
  let { buttonProps } = useButton(props, ref);
  let { focusProps, isFocusVisible } = useFocusRing();
  return (
    <button
      {...mergeProps(buttonProps, focusProps)}
      ref={ref}
      className={`p-2.5 rounded-lg ${props.isDisabled ? "text-gray-400" : ""} ${!props.isDisabled ? "hover:bg-primary-highlight active:bg-primary-highlight" : ""
        } outline-none ${isFocusVisible ? "ring-2 ring-offset-2 ring-purple-600" : ""
        }`}
    >
      {props.children}
    </button>
  );
}

export function FieldButton(props) {
  let ref = useRef();
  let { buttonProps, isPressed } = useButton(props, ref);
  return (
    <button
      {...buttonProps}
      ref={ref}
      className={`px-2 -ml-px border transition-colors rounded-r-md group-focus-within:border-primary-main group-focus-within:group-hover:border-primary-main outline-none ${props?.className && props?.className} ${isPressed || props.isPressed
        ? "bg-gray-200 border-gray-400"
        : "bg-gray-50 border-gray-300 group-hover:border-gray-400"
        }`}
    >
      {props.children}
    </button>
  );
}
